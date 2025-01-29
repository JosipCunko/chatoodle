import { createContactAction } from "@/app/_lib/actions";
import { errorToast, successToast } from "../_lib/utils";
import { useRef, useEffect } from "react";

export default function CreateContactForm({ userId, onClose }) {
  const ref = useOutsideClick(onClose);

  async function handleSubmit(formData) {
    const userIdToAdd = Number(formData.get("contactId"));
    console.log(userId, userIdToAdd);

    if (userIdToAdd === userId) {
      errorToast("You cannot add yourself as a friend!");
    } else {
      const response = await createContactAction(formData);

      if (response.error) {
        errorToast(response.error);
      } else if (response.success) {
        successToast("Contact added successfully!");
        onClose();
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={ref} className="bg-background p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Add New Contact</h2>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <input type="hidden" name="userId" value={userId} />
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>
          <div>
            <label
              htmlFor="contactId"
              className="block text-sm font-medium mb-1"
            >
              User ID
            </label>
            <input
              type="text"
              id="contactId"
              name="contactId"
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export function useOutsideClick(handler, listenCapturing = true) {
  const ref = useRef();

  useEffect(
    function () {
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) {
          handler();
        }
      }
      //First problem, when we click on the button the modal opens for a milisecond, and then immediately click on the outside is detected, so then it will close it
      //Solution: listen the event on the capturing phase, not the bubbling phase

      document.addEventListener("click", handleClick, listenCapturing);

      return () => document.removeEventListener("click", handleClick);
    },
    [handler, listenCapturing]
  );

  return ref;
}
