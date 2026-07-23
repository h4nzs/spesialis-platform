// Static re-export of the editor module so dynamic imports work reliably.
// Importing via subpath export (import('@ahlipanggilan/ui/editor')) can cause
// chunk resolution issues in the production build. This local file ensures
// the bundler resolves the import correctly.
export { RichTextEditor } from '@ahlipanggilan/ui/editor';
