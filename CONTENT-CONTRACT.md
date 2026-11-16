# Retro TV CMS contract

Local-only new public TV UI at `/`, editor at `/admin`. Existing web remains untouched.

GET /api/content returns a document with `revision` number and fields below. PUT /api/content sends the full same shape including current revision, returns saved doc with incremented revision; stale revision 409. GET /api/admin/session returns `{token}`. Mutation requests send `X-Admin-Token` and same-origin checked; no CORS. GET /api/media returns `{files:[{url,name,type,size}]}`. POST /api/media raw file bytes, `X-File-Name` header (URL-encoded), real Content-Type, returns `{url,name,type,size}`. DELETE /api/media?url=... only unreferenced uploads, same mutation protections. Existing assets read-only. Uploaded media persist in assets/uploads. JSON content persists in storage/content.json with backups on save. Storage and source/server files are not served. Root-bound local server 127.0.0.1:4174.

Content schema:

```
{
 revision: 1,
 profile: {name,shortName,role,location,kicker,homeTitle,homeSubtitle,portrait,resume,footer},
 appearance: {wallImage,posterLeft,posterRight,accent,cream,ink,teal,wood,buttonColor,screenColor,fontFamily,scanlines,transitionMs,soundEnabled},
 channels: [{id,label,subtitle,color,enabled}], // fixed ids home,work,films,about,skills,journey,contact; reorder/edit/enable
 projects: [{...existing projects from data.js,thumbnail,enabled}], // all original existing fields retained
 films: [{id,title,role,duration,file,poster,format,alt,description,enabled}], // file and poster full asset URL, e.g /assets/film...
 about: {title,intro,paragraphs:[],portrait,signature},
 skills: [{title,description,tools:[]}],
 journey: [{period,title,organization,description,type}],
 contact: {title,description,email,github,linkedin,resume,label},
 posters: [{title,subtitle,image,channel,enabled}]
}
```

All asset fields full root paths `/assets/...` or validated https URLs. Existing project fields `stack`, `tags`, `flow`, `links` stay. Default fonts `retro` (local serif/display + monospace), alternate `serif`, `mono`. Colours hexadecimal #rrggbb. UI must escape content before HTML, safe href protocols only. Server validate shape, lengths/counts/media paths/colours, revision, total payload. No eval or arbitrary filesystem path writes. Admin editable all fields except revision, structural channel ids and project/film ids. All arrays CRUD/reorder except channels only reorder/edit/toggle. Top-level profile/about/contact/appearance section objects cannot be deleted. For themes, preserve new generated files created by root; default wallImage `/assets/retro-room.png` (root generates), posterLeft and posterRight can be blank for designed CSS posters. Public reads all fields.

Server/backend owner: seed-content.mjs, server.mjs, storage, API tests only. Admin owner: admin.html, admin.js, admin.css only. Root owns public index.html, tv.js, tv.css and visual assets. Do not edit another owner's files.
# Quote frames and client work extension

The content document now also requires `quotes`, `services`, and `reviews`, and eight channel definitions (including `services`). Existing documents migrate on startup with a preserved backup and incremented revision. Existing content and media selections remain intact. Default reviews are empty; publish only genuine feedback with permission.

- `quotes`: up to 100 `{id,text,side,duration,frame,font,color,background,fontSize,enabled}` records. Text is 1–240 characters. Side is `left`, `right`, or `both`; duration is an integer 3–120 seconds; frame is `wood`, `brass`, or `black`; font is `serif`, `mono`, or `display`; colors are six-digit hex; fontSize is 12–40. The admin preview uses the public frame typography and finishes.
- `services`: up to 30 `{title,description}` records (title up to 200, description up to 4000 characters), shown as Work with me slides.
- `reviews`: up to 50 `{id,text,attribution,enabled}` records (text 1–2000, attribution 1–200 characters). New editor entries default to hidden and must be replaced with approved real feedback before enabling.

