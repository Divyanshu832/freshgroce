import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Check if the modal has been shown before in this session
  useEffect(() => {
    const hasSeenWelcomeModal = localStorage.getItem("hasSeenWelcomeModal");
    if (!hasSeenWelcomeModal) {
      setIsOpen(true);
    }
  }, []);

  function closeModal() {
    setIsOpen(false);
    // Set flag in localStorage to prevent showing again in this session
    localStorage.setItem("hasSeenWelcomeModal", "true");
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-1"
                  aria-label="Close modal"
                >
                  <FaTimes size={28} />
                </button>

                <img
                  src="/sales.jpg"
                  alt="Welcome"
                  className="max-h-[80vh] w-auto max-w-[90vw]"
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
