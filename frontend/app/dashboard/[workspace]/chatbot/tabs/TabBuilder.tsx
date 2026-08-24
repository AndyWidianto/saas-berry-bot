
// export default function TabBuilder() {

//     return (
//         <div className="flex flex-1 overflow-hidden">
//             <div className="w-52 border-r border-border bg-card overflow-y-auto p-3 flex-shrink-0">
//                 <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Node Types</p>
//                 <div className="space-y-1">
//                     {Object.entries(nodeTypeConfig).map(([type, cfg]) => (
//                         <div key={type} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted cursor-grab text-xs text-foreground">
//                             <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
//                                 <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
//                             </div>
//                             <span>{cfg.label}</span>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle,_var(--border)_1px,_transparent_1px)] bg-[length:24px_24px]">
//                 <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-md z-10">
//                     <button className="text-xs text-muted-foreground hover:text-foreground px-1 font-mono">-</button>
//                     <span className="text-xs font-medium text-foreground w-10 text-center">100%</span>
//                     <button className="text-xs text-muted-foreground hover:text-foreground px-1 font-mono">+</button>
//                     <div className="w-px h-4 bg-border" />
//                     <button className="text-xs text-muted-foreground hover:text-foreground">Fit</button>
//                 </div>

//                 <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ left: 100 }}>
//                     {flowEdges.map((edge, i) => {
//                         const src = nodes.find(n => n.id === edge.from);
//                         const tgt = nodes.find(n => n.id === edge.to);
//                         if (!src || !tgt) return null;
//                         const s = getNodeCenter(src);
//                         const t = getNodeCenter(tgt);
//                         const my = (s.y + t.y) / 2;
//                         return (
//                             <g key={i}>
//                                 <path d={`M${s.x} ${s.y + 10} C${s.x} ${my} ${t.x} ${my} ${t.x} ${t.y - 10}`} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3" />
//                                 <circle cx={t.x} cy={t.y - 10} r="3" fill="var(--primary)" />
//                             </g>
//                         );
//                     })}
//                 </svg>

//                 {nodes.map(node => {
//                     const cfg = nodeTypeConfig[node.type];
//                     return (
//                         <div
//                             key={node.id}
//                             onClick={() => setSelectedNode(node)}
//                             className={cn("absolute w-44 cursor-pointer rounded-xl border-2 transition-all select-none", selectedNode?.id === node.id ? "shadow-lg" : "hover:shadow-md")}
//                             style={{
//                                 left: node.x + 100,
//                                 top: node.y + 60,
//                                 borderColor: selectedNode?.id === node.id ? cfg.color : "var(--border)",
//                                 backgroundColor: "var(--card)",
//                             }}
//                         >
//                             <div className="px-3 py-2.5 flex items-center gap-2">
//                                 <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
//                                     <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
//                                 </div>
//                                 <div>
//                                     <p className="text-[10px] font-medium text-muted-foreground">{cfg.label}</p>
//                                     <p className="text-xs font-semibold text-foreground leading-tight">{node.label}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             <div className="w-64 border-l border-border bg-card overflow-y-auto p-4 flex-shrink-0">
//                 <h3 className="text-sm font-semibold mb-4">Properties</h3>
//                 {selectedNode ? (
//                     <div className="space-y-4">
//                         <div>
//                             <label className="text-xs text-muted-foreground block mb-1.5">Node Label</label>
//                             <input className="w-full bg-muted rounded-lg px-3 py-2 text-xs border border-border focus:border-primary/50 focus:outline-none" defaultValue={selectedNode.label} />
//                         </div>
//                         <div>
//                             <label className="text-xs text-muted-foreground block mb-1.5">Node Type</label>
//                             <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
//                                 <span className="text-xs font-medium capitalize">{selectedNode.type}</span>
//                             </div>
//                         </div>
//                         {selectedNode.type === "message" && (
//                             <div>
//                                 <label className="text-xs text-muted-foreground block mb-1.5">Message Content</label>
//                                 <textarea className="w-full bg-muted rounded-lg px-3 py-2 text-xs resize-none border border-border focus:border-primary/50 focus:outline-none" rows={4} placeholder="Enter message text..." defaultValue="Welcome! How can I help you today?" />
//                             </div>
//                         )}
//                         {selectedNode.type === "condition" && (
//                             <div>
//                                 <label className="text-xs text-muted-foreground block mb-1.5">Condition</label>
//                                 <select className="w-full bg-muted rounded-lg px-3 py-2 text-xs border border-border focus:outline-none">
//                                     <option>Contains keyword</option>
//                                     <option>Equals</option>
//                                     <option>Starts with</option>
//                                 </select>
//                             </div>
//                         )}
//                         {selectedNode.type === "delay" && (
//                             <div>
//                                 <label className="text-xs text-muted-foreground block mb-1.5">Delay Duration</label>
//                                 <div className="flex gap-2">
//                                     <input type="number" defaultValue={5} className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs border border-border focus:outline-none" />
//                                     <select className="bg-muted rounded-lg px-2 py-2 text-xs border border-border focus:outline-none">
//                                         <option>min</option><option>hours</option><option>days</option>
//                                     </select>
//                                 </div>
//                             </div>
//                         )}
//                         <Btn variant="danger" size="sm" icon={Trash2} className="w-full justify-center">Remove Node</Btn>
//                     </div>
//                 ) : (
//                     <p className="text-xs text-muted-foreground">Select a node to edit its properties.</p>
//                 )}
//             </div>
//         </div>
//     )
// }