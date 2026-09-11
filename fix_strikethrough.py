import re

with open("src/pages/BillGenerator.tsx", "r") as f:
    content = f.read()

# Replace the meta block
old_meta = """              <div className="meta">
                <span style={{ display: "inline-flex", alignItems: "flex-end" }}>No. <span style={{ borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px", marginLeft: "4px" }}>{billNo}</span></span>
                <span style={{ display: "inline-flex", alignItems: "flex-end" }}>Date :- <span style={{borderBottom:'1.5px solid #111', padding:'0 8px', marginLeft: "4px"}}>{date}</span></span>
              </div>"""

new_meta = """              <div className="meta">
                <span>No. <span style={{ textDecoration:"underline", textUnderlineOffset:"4px", textDecorationThickness:"2px", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px" }}>{billNo}</span></span>
                <span>Date :- <span style={{ textDecoration:"underline", textUnderlineOffset:"4px", textDecorationThickness:"1.5px", padding:"0 8px" }}>{date}</span></span>
              </div>"""

content = content.replace(old_meta, new_meta)

with open("src/pages/BillGenerator.tsx", "w") as f:
    f.write(content)

with open("src/pages/InvoiceGenerator.tsx", "r") as f:
    inv = f.read()

old_meta_inv = """              <div className="meta">
                <span style={{ display: "inline-flex", alignItems: "flex-end" }}>No. <span style={{ borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px", marginLeft: "4px" }}>{invoiceNo}</span></span>
                <span style={{ display: "inline-flex", alignItems: "flex-end" }}>Date :- <span style={{borderBottom:'1.5px solid #111', padding:'0 8px', marginLeft: "4px"}}>{date}</span></span>
              </div>"""

new_meta_inv = """              <div className="meta">
                <span>No. <span style={{ textDecoration:"underline", textUnderlineOffset:"4px", textDecorationThickness:"2px", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px" }}>{invoiceNo}</span></span>
                <span>Date :- <span style={{ textDecoration:"underline", textUnderlineOffset:"4px", textDecorationThickness:"1.5px", padding:"0 8px" }}>{date}</span></span>
              </div>"""

inv = inv.replace(old_meta_inv, new_meta_inv)

with open("src/pages/InvoiceGenerator.tsx", "w") as f:
    f.write(inv)

print("Fixed strikethrough")
