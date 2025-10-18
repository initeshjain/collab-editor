import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes in milliseconds

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const documents = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handler(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("join-document", (documentId) => {
      socket.join(documentId);
      if (!documents.has(documentId)) {
        documents.set(documentId, {
          content: "",
          version: 0,
          operations: [],
          lastActive: Date.now(),
        });
      }
      const doc = documents.get(documentId);
      socket.emit("document-state", {
        content: doc.content,
        version: doc.version,
      });
      socket.to(documentId).emit("user-joined", socket.id);
    });

    socket.on("operation", (data) => {
      try {
        const { documentId, operation, clientVersion, currentContent } = data;
        if (!documents.has(documentId)) {
          console.log(`Recreating document ${documentId} due to new activity`);
          documents.set(documentId, {
            content: currentContent ?? '',
            version: 0,
            operations: [],
            lastActive: Date.now(),
          });
        }

        const doc = documents.get(documentId);

        // Update lastActive timestamp on activity
        doc.lastActive = Date.now();

        let transformedOp = operation;
        const opsToTransform = doc.operations.slice(clientVersion);

        for (const serverOp of opsToTransform) {
          transformedOp = transformOperations(serverOp, transformedOp, true);
        }

        doc.content = applyOperation(doc.content, transformedOp);
        doc.version++;
        doc.operations.push(transformedOp);

        socket.to(documentId).emit("operation", {
          operation: transformedOp,
          version: doc.version,
          clientId: socket.id,
          currentContent: doc.content,
        });

        socket.emit("operation-ack", { version: doc.version });
      } catch (error) {
        console.error('Error processing operation:', error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () =>
    console.log(`✅ Server running on http://${hostname}:${port}`)
  );
});

// Clean-up inactive sessions every minute:
setInterval(() => {
  const now = Date.now();
  for (const [documentId, doc] of documents.entries()) {
    if (now - doc.lastActive > INACTIVITY_LIMIT) {
      console.log(`Removing inactive document ${documentId}`);
      documents.delete(documentId);
    }
  }
}, INACTIVITY_LIMIT); // Run cleanup every 60 seconds

// --- Operational Transformation helpers below ---
function transformOperations(opA, opB, isAFirst = true) {
  if (opA.type === "insert" && opB.type === "insert") {
    if (opA.position <= opB.position) {
      return { ...opB, position: opB.position + opA.content.length };
    } else if (opA.position === opB.position && !isAFirst) {
      return { ...opB, position: opB.position + opA.content.length };
    }
    return opB;
  }
  if (opA.type === "insert" && opB.type === "delete") {
    if (opA.position <= opB.position) {
      return { ...opB, position: opB.position + opA.content.length };
    } else if (opA.position <= opB.position + opB.length) {
      return { ...opB, length: opB.length + opA.content.length };
    }
    return opB;
  }
  if (opA.type === "delete" && opB.type === "insert") {
    if (opB.position <= opA.position) {
      return opB;
    } else if (opB.position <= opA.position + opA.length) {
      return { ...opB, position: opA.position };
    } else {
      return { ...opB, position: opB.position - opA.length };
    }
  }
  if (opA.type === "delete" && opB.type === "delete") {
    if (opB.position + opB.length <= opA.position) {
      return { ...opA, position: opA.position - opB.length };
    } else if (opB.position >= opA.position + opA.length) {
      return opB;
    } else {
      const start = Math.min(opA.position, opB.position);
      const end = Math.max(opA.position + opA.length, opB.position + opB.length);
      return { type: "delete", position: start, length: end - start };
    }
  }
  return opB;
}

function applyOperation(text, operation) {
  switch (operation.type) {
    case "insert":
      return (
        text.slice(0, operation.position) +
        operation.content +
        text.slice(operation.position)
      );
    case "delete":
      return (
        text.slice(0, operation.position) +
        text.slice(operation.position + operation.length)
      );
    case "replace":
      return (
        text.slice(0, operation.position) +
        operation.content +
        text.slice(operation.position + operation.deleteLength)
      );
    default:
      return text;
  }
}
