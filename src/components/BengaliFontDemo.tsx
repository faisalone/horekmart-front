import { AutoFontText, SmartText } from '@/components/AutoFontText';

export default function BengaliFontDemo() {
  const sampleTexts = [
    {
      text: 'Welcome to our store',
      type: 'English'
    },
    {
      text: 'আমাদের দোকানে স্বাগতম',
      type: 'Bengali'
    },
    {
      text: 'Mixed content: আপনার জন্য Best Products',
      type: 'Mixed'
    },
    {
      text: 'Electronics - ইলেকট্রনিক্স',
      type: 'Mixed'
    },
    {
      text: 'গৃহস্থালী পণ্য',
      type: 'Bengali'
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Bengali Font Integration Demo</h1>
      
      <div className="space-y-4">
        {sampleTexts.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-sm text-gray-500 mb-2">{item.type} Text:</div>
            <AutoFontText className="text-lg leading-relaxed">
              {item.text}
            </AutoFontText>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Different Font Styles</h2>
        <div className="space-y-3">
          <div className="p-3 border rounded bg-gray-50">
            <SmartText 
              text="আপনার প্রিয় পণ্য খুঁজুন" 
              className="text-lg font-bold text-blue-600"
            />
          </div>
          
          <div className="p-3 border rounded bg-gray-50">
            <AutoFontText className="text-base text-gray-700">
              Find your favorite products - আপনার পছন্দের পণ্যগুলি খুঁজুন
            </AutoFontText>
          </div>
          
          <div className="p-3 border rounded bg-gray-50">
            <AutoFontText className="text-sm text-gray-600">
              ক্যাটাগরি: Category Selection
            </AutoFontText>
          </div>
        </div>
      </div>
    </div>
  );
}
