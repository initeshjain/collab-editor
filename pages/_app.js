import Footer from "@/components/footer";
import { StatusChecker } from "@/components/StatusChecker";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return <div className="flex flex-col min-h-screen">
    <StatusChecker>
      <Component {...pageProps} />
    </StatusChecker>
    <Footer />
  </div>
}
