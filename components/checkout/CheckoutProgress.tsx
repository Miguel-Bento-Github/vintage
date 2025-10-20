interface CheckoutProgressProps {
  currentStep: 1 | 2 | 3;
}

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps = [
    { number: 1, label: 'Information' },
    { number: 2, label: 'Review' },
    { number: 3, label: 'Payment' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            {/* Step container */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                  currentStep >= step.number
                    ? 'bg-amber-700 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              {/* Label */}
              <span
                className={`mt-3 text-sm whitespace-nowrap ${
                  currentStep >= step.number ? 'text-amber-700 font-medium' : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-amber-700' : 'bg-gray-200'
                }`}
                style={{ marginBottom: '3rem' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
