//Throws an error if its a server component
"use client";

import { Pencil } from "lucide-react";
import { errorToast, successToast } from "../_lib/utils";
import { updatePhoneNumberAction } from "../_lib/actions";

function UpdateAccountForm({ currentUser }) {
  async function handleSubmit(formData) {
    const phoneNumber = Number(formData.get("phoneNumber"));
    if (!phoneNumber) return;

    const phoneNumberRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

    if (!phoneNumberRegex.test(phoneNumber)) {
      errorToast("Please enter a valid phone number.");
      return;
    }

    const response = await updatePhoneNumberAction(formData);

    if (response.error) {
      errorToast(response.error);
    } else if (response.success) {
      successToast("Phone number updated successfully!");
    }
  }

  return (
    <form action={handleSubmit} className="flex items-center w-full">
      <input type="hidden" value={currentUser.userId} name="currentUserId" />
      <input
        type="text"
        name="phoneNumber"
        placeholder="You haven't added your phone number yet"
        defaultValue={currentUser.phone_number ?? ""}
        className="flex-1 px-3 py-1.5 border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-text-primary"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-600 transition duration-150 ease-in-out"
      >
        <Pencil size={20} />
      </button>
    </form>
  );
}

export default UpdateAccountForm;
