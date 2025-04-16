import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { PaymentMethod } from "../../appwrite/databaseUtils";
import { FaSpinner } from "react-icons/fa";

export default function Modal({
  name,
  address,
  pincode,
  phoneNumber,
  setName,
  setAddress,
  setPincode,
  setPhoneNumber,
  paymentMethod,
  setPaymentMethod,
  area,
  setArea,
  buyNow,
  isProcessing,
}) {
  let [isOpen, setIsOpen] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Ensure phoneNumber always starts with +91
  useEffect(() => {
    if (!phoneNumber.startsWith("+91")) {
      setPhoneNumber("+91" + phoneNumber.replace("+91", ""));
    }
  }, [phoneNumber, setPhoneNumber]);

  // Handle phone number input with validation
  const handlePhoneChange = (e) => {
    const input = e.target.value;

    // Allow only the prefix +91 followed by digits
    if (input.startsWith("+91")) {
      // Extract the part after +91
      const numberPart = input.substring(3);

      // Allow only digits after +91 and limit to 10 digits
      if (/^\d*$/.test(numberPart) && numberPart.length <= 10) {
        setPhoneNumber(input);
        if (numberPart.length === 10) {
          setPhoneError("");
        } else if (numberPart.length > 0) {
          setPhoneError("Phone number must be exactly 10 digits after +91");
        } else {
          setPhoneError("");
        }
      }
    } else {
      // If someone tries to remove the prefix, restore it
      setPhoneNumber("+91" + input.replace(/\D/g, "").substring(0, 10));
    }
  };

  // Validate phone number before placing order
  const validateAndBuyNow = () => {
    const numberPart = phoneNumber.substring(3);
    if (numberPart.length !== 10) {
      setPhoneError("Bhai number to sahi de de!!");
      return;
    }
    setPhoneError("");
    buyNow();
  };

  function closeModal() {
    // Only allow closing if not currently processing an order
    if (!isProcessing) {
      setIsOpen(false);
    }
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="  text-center rounded-lg text-white font-bold">
        <button
          type="button"
          onClick={openModal}
          className="w-full bg-green-600 py-2 text-center rounded-lg text-white font-bold hover:bg-green-700"
        >
          Place Order
        </button>
      </div>

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
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl p-2  text-left align-middle shadow-xl transition-all bg-gray-50">
                  <section className="">
                    <div className="flex flex-col items-center justify-center py-8 mx-auto  lg:py-0">
                      <div className="w-full  rounded-lg md:mt-0 sm:max-w-md xl:p-0 ">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                          <form className="space-y-4 md:space-y-6" action="#">
                            <div>
                              <label
                                htmlFor="name"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Enter Full Name
                              </label>
                              <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                type="name"
                                name="name"
                                id="name"
                                className=" border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100"
                                required
                                disabled={isProcessing}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="email"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Enter Full Address
                              </label>
                              <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                type="text"
                                name="address"
                                id="address"
                                className=" border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100"
                                required
                                disabled={isProcessing}
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="area"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Select Area
                              </label>
                              <select
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                name="area"
                                id="area"
                                className="border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100"
                                required
                                disabled={isProcessing}
                              >
                                <option value="">Select your area</option>
                                <option value="Ananda Nagar">
                                  Anand Nagar
                                </option>
                                <option value="Patel Nagar">Patel Nagar</option>
                                <option value="RatnaGiri">RatnaGiri</option>
                                <option value="Piplani">Piplani</option>
                                <option value="Indrapuri Sector C">
                                  Indrapuri Sector C
                                </option>
                              </select>
                              <p className="mt-1 text-xs text-red-500">
                                *Currently, We are serving only 5 locations
                              </p>
                            </div>

                            <div>
                              <label
                                htmlFor="pincode"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Enter Pincode
                              </label>
                              <input
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                type="text"
                                name="pincode"
                                id="pincode"
                                className=" border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100"
                                required
                                disabled={isProcessing}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="mobileNumber"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Enter Mobile Number
                              </label>
                              <input
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                type="text"
                                name="mobileNumber"
                                id="mobileNumber"
                                className={`border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100 ${
                                  phoneError ? "border-red-500" : ""
                                }`}
                                required
                                disabled={isProcessing}
                                placeholder="+91XXXXXXXXXX"
                              />
                              {phoneError && (
                                <p className="mt-1 text-xs text-red-500">
                                  {phoneError}
                                </p>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor="paymentMethod"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Payment Method
                              </label>
                              <select
                                value={paymentMethod}
                                onChange={(e) =>
                                  setPaymentMethod(e.target.value)
                                }
                                name="paymentMethod"
                                id="paymentMethod"
                                className="border outline-0 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-100"
                                required
                                disabled={isProcessing}
                              >
                                <option value="">Select payment method</option>
                                <option value={PaymentMethod.COD}>
                                  Cash On Delivery (COD)
                                </option>
                                <option value={PaymentMethod.UPI}>UPI</option>
                              </select>
                            </div>
                          </form>
                          <button
                            onClick={() => {
                              if (!isProcessing) {
                                validateAndBuyNow();
                              }
                            }}
                            type="button"
                            disabled={isProcessing}
                            className="focus:outline-none w-full text-white bg-green-600 hover:bg-green-700 outline-0 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center"
                          >
                            {isProcessing ? (
                              <>
                                <FaSpinner className="animate-spin mr-2" />
                                Processing Order...
                              </>
                            ) : (
                              "Confirm Order"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
