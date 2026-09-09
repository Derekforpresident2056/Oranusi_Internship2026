import { useEffect, useRef } from 'react';

interface ManageStockModalProps {
  isOpen: boolean;
  editingItem: any;
  formData: { title: string; image: string; link: string; price: string; description: string; tags: string };
  setFormData: React.Dispatch<React.SetStateAction<{ title: string; image: string; link: string; price: string; description: string; tags: string }>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export default function GameDrawerModal({
  isOpen,
  editingItem,
  formData,
  setFormData,
  onSubmit,
  onClose
}: ManageStockModalProps) {
  const widgetRef = useRef<any>(null);

  // Initialize the Cloudinary widget when the modal opens
  useEffect(() => {
    if (isOpen && (window as any).cloudinary) {
      widgetRef.current = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: 'qgtiv7qi', // <-- Replace with your Cloud Name
          uploadPreset: 'game_covers_preset', // <-- Replace with your Unsigned Preset
          multiple: false,
          cropping: true, // Allows users to crop their game covers!
          clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            // Update your state with the newly uploaded Cloudinary secure URL!
            setFormData((prev) => ({ ...prev, image: result.info.secure_url }));
          }
        }
      );
    }
  }, [isOpen, setFormData]);

  const handleUploadClick = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      alert("Cloudinary script has not loaded yet. Please try again.");
    }
  };

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {editingItem ? 'Edit Catalog Item' : 'Add New Catalog Item'}
        </h2>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">Title</label>
            <input 
              type="text" required
              className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase">Price</label>
              <input 
                type="number" step="0.01" required
                className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase">Tags</label>
              <input 
                type="text" placeholder="action, rpg, indie"
                className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
                value={formData.tags} 
                onChange={(e) => setFormData({...formData, tags: e.target.value})} 
              />
            </div>
          </div>

          {/* IMAGE FIELD WITH UPLOAD BUTTON */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Image URL</label>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="https://example.com/image.jpg"
                className="flex-1 border p-2 rounded text-sm focus:outline-blue-500 text-black"
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})} 
              />
              <button
                type="button"
                onClick={handleUploadClick}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded transition"
              >
                Upload
              </button>
            </div>
            {formData.image && (
              <div className="mt-2">
                <p className="text-[10px] text-gray-400 mb-1">Preview:</p>
                <img src={formData.image} alt="Preview" className="h-16 w-16 object-cover rounded border" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">Link</label>
            <input 
              type="text"
              className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
              value={formData.link} 
              onChange={(e) => setFormData({...formData, link: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">Description</label>
            <textarea 
              rows={3}
              className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 