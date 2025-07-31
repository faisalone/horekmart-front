/*
🔧 Context:
I'm building a product form in a Laravel + React (Next.js) fullstack monorepo.

📦 Backend: Laravel 12 using Spatie Media Library
🖼️ Frontend: React + Next.js (App Router)

✅ Goal:
Update the product storing and updating logic to support:
- Ordered product gallery images (Spatie collection: 'images')
- Single thumb image (Spatie collection: 'thumb')

✅ STORE CONTROLLER METHOD:
Currently in `store()`, I'm using:
- `$product->addMediaFromRequest('thumb')->toMediaCollection('thumb');`
- Looping through `$request->file('images')` and adding to `'images'` collection

❗Update needed:
- Accept ordered images using `images[]` input (no need to change here, just store as-is)
- Optional enhancement: store new images in order they arrive

✅ UPDATE CONTROLLER METHOD:
Currently in `update()`, I do:
- `$product->clearMediaCollection('images')` and re-add all images
- This **replaces** all images and **loses existing ones**

❗Update needed:
- Accept `images` as an ordered JSON array from frontend
   → Elements can be either existing media UUIDs or `''` for new images
- Accept `new_files[]` as the actual new uploaded files
- Loop through `images[]`:
   → If UUID: match existing media and update `order_column`
   → If empty string: attach next new file and set order
- Delete any previously attached media not found in updated UUID list

✅ FRONTEND (React + Next.js):
On form submit:
- Send `images` as an ordered JSON string in FormData
   → each element is either existing image UUID or `''` (for new uploads)
- Send `new_files[]` as actual `File` inputs for new uploads
- Use drag-and-drop or manual ordering in UI to allow user to control order

🧩 Copilot, generate:
- Updated Laravel controller methods `store()` and `update()` as described above
- React component (or logic) that builds the FormData accordingly with `images` and `new_files[]`
- Ensure existing images are kept by UUID, and new ones are uploaded in correct order
*/
