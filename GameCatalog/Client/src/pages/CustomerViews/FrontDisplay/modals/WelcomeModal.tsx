import { dashboardstyles as dashstyle } from '../styles';
import { useNavigate } from 'react-router-dom'

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}



export default function WelcomeModal({isOpen, onClose}: WelcomeModalProps) {

  const navigate = useNavigate();

  // If the modal isn't open, return nothing
  if (!isOpen) return null;

  const PushCatalog = () => {
    onClose(); // Optional: Close the modal right before navigating away
    navigate('/customer/catalog');
  };

  return(
          
        <div className={dashstyle.backdrop} onClick={onClose}>
            
          {/* Modal Container */}
          <div className={dashstyle.WelcomeModalContainer}>

            {/* Close Button Inside Modal */}
            <button onClick={onClose} className={dashstyle.CloseButton}> &times; </button>

            {/* Modal Content */}
            <h2 className={dashstyle.ModalTitleText}> WELCOME TO THE ARCHIVE </h2>

            <p className={dashstyle.ModalParagraphText}>
              Discover raw, unfiltered gaming backgrounds, custom parallax views, and complete library lists.
            </p>

            <div className={dashstyle.ModalInnerBox}>
              <p>💡 <strong>Tip:</strong> Click anywhere outside this window to dismiss it.</p>
              <p>🌐 Use the <strong>Top-Left button</strong> anytime to browse our full inventory catalogs.</p>
            </div>

            <button onClick={PushCatalog} className={dashstyle.ModalProceedButton}> Browse Our Complete Selection </button>

          </div>
        </div>
      
  );

}