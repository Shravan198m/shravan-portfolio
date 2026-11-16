# Source and media audit

Read-only review of index.html, app.js, data.js, styles.css, and server.mjs. Browser validation is owned by the main implementation agent.

## Findings resolved and verified

1. Glaucoma project stack in data.js lists PyTorch. The supplied resume specifies TensorFlow and Keras for that project; PyTorch belongs to underwater enhancement.
2. Club Production image alt text says monochrome, but the corrected poster is a colour frame of two club members wearing sunglasses.
3. The project-card focus-within border rule precedes equally specific theme border rules, while the project button outline is disabled. Rust, teal, plum and sand cards therefore lose their visible keyboard focus. Apply a final focus-visible card outline or move focus styling after theme rules.

The implementer corrected the glaucoma stack to TensorFlow/Keras, updated the Club Production alt description, and added a card outline using :has(button:focus-visible). Source reinspection confirms all three corrections. No unresolved source findings remain.

## Checks completed

- All 25 source web files match qa/original-hashes.json. Existing project is unchanged.
- All HTML hash navigation targets resolve.
- All local referenced media, source files, resume and favicon exist and return HTTP 200.
- JavaScript, CSS, PDF and MP4 responses have appropriate MIME types.
- Corrected film requests with bytes=0-99, bytes=-100 and bytes=0-0 return correct HTTP 206 payload lengths and Content-Range. Out-of-bounds requests return 416.
- Corrected films were separately fully decoded without errors, visually inspected for upright orientation, and checked for moov preceding mdat (faststart).
- Project text is consistent with source resume after the glaucoma stack correction. AarogyaLink is correctly presented as a concept; no invented deployed service or client claims found.

## Scope limits

- External destination availability was not tested. Links were extracted from the supplied resume.
- This source review does not substitute for keyboard, responsive layout or video playback checks in a browser.
