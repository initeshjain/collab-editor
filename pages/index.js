import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const router = useRouter();

  const createSession = () => {
    const id = uuidv4();
    router.push(`/edit/${id}`);
  };

  return (
    <div className="flex flex-col flex-grow justify-center items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 min-h-[calc(100vh-72px)]">
      <h1 className="text-5xl font-extrabold text-white mb-10 drop-shadow-lg">
        Collaborative Editor
      </h1>
      <button
        onClick={createSession}
        className="px-8 py-3 bg-white text-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 cursor-pointer"
        type="button"
      >
        Create Document
      </button>
    </div>
  );
}
