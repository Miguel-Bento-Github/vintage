import { CheckoutFormData, CheckoutFormErrors } from '@/types/checkout';

interface CustomerInfoFormProps {
  formData: CheckoutFormData;
  formErrors: CheckoutFormErrors;
  onFormDataChange: (data: CheckoutFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CustomerInfoForm({
  formData,
  formErrors,
  onFormDataChange,
  onNext,
  onBack,
}: CustomerInfoFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Information</h2>
        <p className="text-gray-600">Enter your contact and shipping details</p>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="you@example.com"
          />
          {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
        </div>

        {/* Street Address */}
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            id="street"
            value={formData.street}
            onChange={(e) => onFormDataChange({ ...formData, street: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 ${
              formErrors.street ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g. 123 Rue de Rivoli, Hauptstraße 45"
          />
          {formErrors.street && <p className="mt-1 text-sm text-red-600">{formErrors.street}</p>}
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 ${
                formErrors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Paris, Berlin, Amsterdam"
            />
            {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province/Region *
            </label>
            <input
              type="text"
              id="state"
              value={formData.state}
              onChange={(e) => onFormDataChange({ ...formData, state: e.target.value })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 ${
                formErrors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. CA, Bavaria, Île-de-France"
            />
            {formErrors.state && <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => onFormDataChange({ ...formData, postalCode: e.target.value })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 ${
                formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. 75001, 10115, SW1A 1AA"
            />
            {formErrors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => onFormDataChange({ ...formData, country: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700 ${
              formErrors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Country</option>
            <optgroup label="Europe">
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
              <option value="NL">Netherlands</option>
              <option value="BE">Belgium</option>
              <option value="AT">Austria</option>
              <option value="CH">Switzerland</option>
              <option value="PT">Portugal</option>
              <option value="SE">Sweden</option>
              <option value="NO">Norway</option>
              <option value="DK">Denmark</option>
              <option value="FI">Finland</option>
              <option value="PL">Poland</option>
              <option value="CZ">Czech Republic</option>
              <option value="IE">Ireland</option>
              <option value="GB">United Kingdom</option>
            </optgroup>
            <optgroup label="North America">
              <option value="US">United States</option>
              <option value="CA">Canada</option>
            </optgroup>
          </select>
          {formErrors.country && <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          Back to Cart
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition font-medium"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
