#!/bin/sh
cd "$(dirname "$0")"
{ cat src/a_head.html; cat src/b_core.js src/c_quvur.js src/d_payvand.js src/e_yoyilma.js src/f_malumot.js src/h_quvur2.js src/i_payvand2.js src/j_more.js src/g_app.js; printf '</script>\n</body>\n</html>\n'; } > www/index.html
