import { baseUrlMessageGateway } from "@/lib/shared/shared";
import { Check, Code2, Copy, Globe } from "lucide-react";
import { useState } from "react";


export default function CodeBlock({ prefix, apikey }: { prefix?: string, apikey?: string }) {
    const [sendMethod, setSendMethod] = useState<"sdk" | "curl">("sdk");
    const sdkUsageCode = `
    import { BerrySweet } from 'berry-sweet';

    // 1. Inisialisasi konfigurasi dengan prefixKey dan apiKey
    const client = new BerrySweet({
    prefixKey: ${prefix ?? 'bs_live'}, // Prefix environment Key Anda
    apiKey: process.env.BERRY_SWEET_API_KEY || '${apikey}',
    });

    async function main() {
      try {
          // 2. Kirim pesan via SDK Berry Sweet
          const response = await client.sendMessage({
              sessionId: "1213131",
              message: "Halo, tes koneksi chatbot!",
              user: {
                  externalId: "berry1233",
                  name: "bilqis",
                  email: "bilqis@gmail.com",
              }
          });

          console.log('Pesan berhasil terkirim:', response);
      } catch (error) {
          console.error('Gagal mengirim pesan:', error);
      }
    }

    main();`;

    const curlUsageCode = `curl -X POST "${baseUrlMessageGateway}/${prefix ?? 'YOUR_BERRY_SWEET_KEY_PREFIX'}/sendMessage" \\
  -H "apikey: ${apikey ?? 'YOUR_BERRY_SWEET_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "6281234567890",
    "message": "Halo, ini pesan otomatis via cURL API Berry Sweet!",
    "user": {
      "externalId": "123131",
      "name": "Bilqis",
      "email": "example@gmail.com"
    }
  }'`;

    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="relative bg-slate-950 text-slate-50 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
            {/* Top Control Bar with Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2 font-sans">
                    <button
                        onClick={() => setSendMethod("sdk")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${sendMethod === "sdk"
                            ? "bg-slate-200 text-slate-900 font-semibold shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                            }`}
                    >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Node.js SDK</span>
                    </button>

                    <button
                        onClick={() => setSendMethod("curl")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${sendMethod === "curl"
                            ? "bg-emerald-600 text-white shadow-sm font-semibold"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                            }`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span>cURL API</span>
                    </button>
                </div>

                <button
                    onClick={() =>
                        handleCopy(
                            sendMethod === "sdk" ? sdkUsageCode : curlUsageCode,
                            "step2"
                        )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95 ml-auto"
                >
                    {copiedCode === "step2" ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-sans font-medium">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-sans">Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            <pre className="p-4 sm:p-5 overflow-x-auto leading-relaxed font-mono text-slate-200 bg-slate-950">
                <code>
                    {sendMethod === "sdk" ? (
                        <>
                            <span className="text-violet-400 font-semibold">import</span>{" "}
                            <span className="text-slate-100">{`{ BerrySweet }`}</span>{" "}
                            <span className="text-violet-400 font-semibold">from</span>{" "}
                            <span className="text-emerald-400">'berry-sweet'</span>;{"\n\n"}

                            <span className="text-slate-500">// 1. Inisialisasi konfigurasi</span>{"\n"}
                            <span className="text-violet-400 font-semibold">const</span>{" "}
                            <span className="text-sky-300">client</span> ={" "}
                            <span className="text-amber-400 font-semibold">new</span>{" "}
                            <span className="text-sky-300">BerrySweet</span>({`{\n`}
                            {'  '}<span className="text-violet-400">prefixKey</span>: <span className="text-emerald-400">'{prefix ?? 'bs_live'}'</span>,{"\n"}
                            {'  '}<span className="text-violet-400">apiKey</span>: <span className="text-sky-300">process</span>.<span className="text-sky-300">env</span>.<span className="text-amber-300">BERRY_SWEET_API_KEY</span> || <span className="text-emerald-400">'{apikey ?? 'YOUR_BERRY_SWEET_API_KEY'}'</span>,{"\n"}
                            {`}`});{"\n\n"}

                            <span className="text-violet-400 font-semibold">async function</span>{" "}
                            <span className="text-sky-300">main</span>() {`{\n`}
                            {'  '}<span className="text-violet-400 font-semibold">try</span> {`{\n`}
                            {'    '}<span className="text-slate-500">// 2. Kirim pesan via SDK</span>{"\n"}
                            {'    '}<span className="text-violet-400 font-semibold">const</span> <span className="text-sky-300">response</span> = <span className="text-violet-400 font-semibold">await</span> <span className="text-sky-300">client</span>.<span className="text-amber-400 font-semibold">sendMessage</span>({`{\n`}
                            {'      '}<span className="text-violet-400">sessionId</span>: <span className="text-emerald-400">'6281234567890'</span>,{"\n"}
                            {'      '}<span className="text-violet-400">message</span>: <span className="text-emerald-400">"Halo, tes koneksi chatbot!"</span>,{"\n"}
                            {'      '}<span className="text-violet-400">user</span>: {`{`} <span className="text-slate-500">// Optional</span>{"\n"}
                            {'       '}<span className="text-violet-400">name</span>: <span className="text-emerald-400">'Bilqis'</span>,{"\n"}
                            {'       '}<span className="text-violet-400">externalId</span>: <span className="text-emerald-400">'berry_1234'</span>,{"\n"}
                            {'       '}<span className="text-violet-400">email</span>: <span className="text-emerald-400">'example@gmail.com'</span>,{"\n"}
                            {`}`},{"\n"}
                            {'    '}{`}`});{"\n\n"}
                            {'    '}<span className="text-sky-300">console</span>.<span className="text-amber-400">log</span>(<span className="text-emerald-400">'Berhasil:'</span>, <span className="text-sky-300">response</span>);{"\n"}
                            {'  '}{`}`} <span className="text-violet-400 font-semibold">catch</span> (<span className="text-sky-300">error</span>) {`{\n`}
                            {'    '}<span className="text-sky-300">console</span>.<span className="text-amber-400">error</span>(<span className="text-emerald-400">'Gagal:'</span>, <span className="text-sky-300">error</span>);{"\n"}
                            {'  '}{`}\n`}
                            {`}\n\n`}
                            <span className="text-sky-300">main</span>();
                        </>
                    ) : (
                        <>
                            <span className="text-amber-400 font-semibold">curl</span>{" "}
                            <span className="text-violet-400">-X POST</span>{" "}
                            <span className="text-emerald-400">"{baseUrlMessageGateway}/{prefix ?? 'YOUR_BERRY_SWEET_KEY_PREFIX'}/sendMessage"</span> \{'\n'}
                            {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"apikey: {apikey ?? 'YOUR_BERRY_SWEET_API_KEY'}"</span> \{'\n'}
                            {'  '}<span className="text-violet-400">-H</span> <span className="text-sky-300">"Content-Type: application/json"</span> \{'\n'}
                            {'  '}<span className="text-violet-400">-d</span> <span className="text-slate-300">'&#123;</span>{'\n'}
                            {'    '}<span className="text-sky-300">"message"</span>: <span className="text-emerald-300">"Halo, tes koneksi chatbot!"</span>,{'\n'}
                            {'    '}<span className="text-sky-300">"sessionId"</span>: <span className="text-emerald-300">"6281234567890"</span>,{'\n'}
                            {'    '}<span className="text-sky-300">"user"</span>: &#123;{'\n'}
                            {'      '}<span className="text-sky-300">"externalId"</span>: <span className="text-emerald-300">"123131"</span>,{'\n'}
                            {'      '}<span className="text-sky-300">"name"</span>: <span className="text-emerald-300">"Bilqis"</span>,{'\n'}
                            {'      '}<span className="text-sky-300">"email"</span>: <span className="text-emerald-300">"example@gmail.com"</span>{'\n'}
                            {'    '}&#125;{'\n'}
                            {'  '}<span className="text-slate-300">&#125;'</span>
                        </>
                    )}
                </code>
            </pre>
        </div>
    )
}