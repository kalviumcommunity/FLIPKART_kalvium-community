export function Footer() {
  return (
    <footer className="bg-[#212121] text-white py-12 mt-8">
      <div className="container mx-auto max-w-[1248px] px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-gray-500 font-bold mb-4 uppercase text-xs">About</h4>
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:underline">Contact Us</li>
            <li className="cursor-pointer hover:underline">About Us</li>
            <li className="cursor-pointer hover:underline">Careers</li>
            <li className="cursor-pointer hover:underline">Flipkart Stories</li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-500 font-bold mb-4 uppercase text-xs">Help</h4>
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:underline">Payments</li>
            <li className="cursor-pointer hover:underline">Shipping</li>
            <li className="cursor-pointer hover:underline">Cancellation & Returns</li>
            <li className="cursor-pointer hover:underline">FAQ</li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-500 font-bold mb-4 uppercase text-xs">Consumer Policy</h4>
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:underline">Return Policy</li>
            <li className="cursor-pointer hover:underline">Terms of Use</li>
            <li className="cursor-pointer hover:underline">Security</li>
            <li className="cursor-pointer hover:underline">Privacy</li>
          </ul>
        </div>
        <div className="md:border-l border-gray-700 md:pl-8">
          <h4 className="text-gray-500 font-bold mb-4 uppercase text-xs">Mail Us:</h4>
          <p className="text-xs leading-relaxed text-gray-300">
            Flipkart Internet Private Limited,
            <br />
            Buildings Alyssa, Begonia &<br />
            Clove Embassy Tech Village,
            <br />
            Outer Ring Road, Devarabeesanahalli Village,
            <br />
            Bengaluru, 560103, Karnataka, India
          </p>
        </div>
      </div>
    </footer>
  );
}
