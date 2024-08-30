import Image from "next/image";

export default function Footer() {
  return <footer aria-labelledby="footer-heading" className="bg-gray-800 w-screen">
    <h2 id="footer-heading" className="sr-only">
      App Footer
    </h2>
    <div className="mx-auto max-w-full px-6 pb-8 pt-12 sm:pt-24 lg:px-8 lg:pt-24">
      <div className="xl:grid xl:grid-cols-3 xl:gap-8">
        <Image src="/logo_c2n.svg" className="h-8 w-auto" height={47} width={40} alt="Picture of the author" />
        <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">SOCIAL</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li key="github">
                  <a href="https://github.com" className="text-sm leading-6 text-gray-300 hover:text-white">
                    Github
                  </a>
                </li>
              </ul>
            </div>
            <div className="mt-10 md:mt-0">
              <h3 className="text-sm font-semibold leading-6 text-white">TOKEN</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li key="github">
                  <a href="https://github.com" className="text-sm leading-6 text-gray-300 hover:text-white">
                    Github
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">HELP</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li key="github">
                  <a href="https://github.com" className="text-sm leading-6 text-gray-300 hover:text-white">
                    Github
                  </a>
                </li>
              </ul>
            </div>
            <div className="mt-10 md:mt-0">
              <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li key="github">
                  <a href="https://github.com" className="text-sm leading-6 text-gray-300 hover:text-white">
                    Github
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-white/10 pt-8 md:flex md:items-center md:justify-between">
        <div className="flex space-x-6 md:order-2">
          {/* {navigation.social.map((item) => (
            <a key={item.name} href={item.href} className="text-gray-500 hover:text-gray-400">
              <span className="sr-only">{item.name}</span>
              <item.icon aria-hidden="true" className="h-6 w-6" />
            </a>
          ))} */}
        </div>
        <p className="mt-8 text-xs leading-5 text-gray-400 md:order-1 md:mt-0">
          &copy; 2020 Your Company, Inc. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
}