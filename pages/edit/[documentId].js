import { useRouter } from "next/router";
import CollaborativeEditor from "../../components/CollaborativeEditor";

export default function EditPage() {
    const router = useRouter();
    const { documentId } = router.query;

    if (!documentId)
        return (
            <div className="flex-grow flex items-center justify-center bg-[#1e1e1e]">
                <p className="text-gray-400 text-lg">Loading...</p>
            </div>
        );

    return (
        <div className="flex-grow bg-[#1e1e1e] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto bg-[#252526] rounded-lg shadow-xl p-6 border border-[#3c3c3c]">
                <h2 className="text-3xl font-semibold text-[#569cd6] mb-6 truncate select-text">
                    Editing Document:{" "}
                    <span className="font-mono text-[#dcdcaa]">{documentId}</span>
                </h2>
                <CollaborativeEditor documentId={documentId} />
            </div>
        </div>
    );
}
