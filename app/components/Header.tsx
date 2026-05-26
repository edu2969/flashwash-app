import Image from "next/image";

export default function Header() {
    return <div className="text-center">
              <Image src="/logo_full.png" alt="FlashWash Logo" width={200} height={50} className="mx-auto mb-4" />
            </div>
}