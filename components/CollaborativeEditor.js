'use client';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000'

export default function CollaborativeEditor({ documentId }) {
    const [content, setContent] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const versionRef = useRef(0);
    const pendingOps = useRef([]);

    useEffect(() => {
        socketRef.current = io(HOSTNAME, {
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            socketRef.current.emit('join-document', documentId);
        });

        socketRef.current.on('document-state', (data) => {
            setContent(data.content);
            versionRef.current = data.version;
        });

        socketRef.current.on('operation', (data) => {
            setContent((old) => applyOperation(old, data.operation));
            versionRef.current = data.version;
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [documentId]);

    const handleChange = (e) => {
        const newText = e.target.value;
        const oldText = content;
        const op = generateOperation(oldText, newText);

        if (op && socketRef.current && isConnected) {
            setContent(newText);
            socketRef.current.emit('operation', {
                documentId,
                operation: op,
                clientVersion: versionRef.current,
            });
        } else {
            setContent(newText);
        }
    };

    return (
        <div className="h-[600px] bg-[#1e1e1e] rounded-md border border-gray-700 shadow-inner">
            <textarea
                className="w-full h-full p-4 bg-[#1e1e1e] text-gray-100 font-mono text-base leading-relaxed resize-none outline-none border-none"
                value={content}
                onChange={handleChange}
                placeholder={isConnected ? 'Connected ✅' : 'Connecting...'}
                spellCheck="false"
            />
        </div>
    );
}

function generateOperation(oldText, newText) {
    let i = 0;
    while (i < Math.min(oldText.length, newText.length) && oldText[i] === newText[i]) i++;
    let j = 0;
    while (
        j < Math.min(oldText.length - i, newText.length - i) &&
        oldText[oldText.length - 1 - j] === newText[newText.length - 1 - j]
    ) j++;

    const delLen = oldText.length - i - j;
    const insertText = newText.slice(i, newText.length - j);

    if (delLen > 0 && insertText) return { type: 'replace', position: i, deleteLength: delLen, content: insertText };
    if (delLen > 0) return { type: 'delete', position: i, length: delLen };
    if (insertText) return { type: 'insert', position: i, content: insertText };
    return null;
}

function applyOperation(text, op) {
    switch (op.type) {
        case 'insert':
            return text.slice(0, op.position) + op.content + text.slice(op.position);
        case 'delete':
            return text.slice(0, op.position) + text.slice(op.position + op.length);
        case 'replace':
            return text.slice(0, op.position) + op.content + text.slice(op.position + op.deleteLength);
        default:
            return text;
    }
}
