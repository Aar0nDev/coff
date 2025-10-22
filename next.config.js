/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'img.freepik.com',
      'media.istockphoto.com',
      'static.vecteezy.com',
      'images.pexels.com',
      'www.shutterstock.com',
      'bakerbynature.com',
      'www.cookingclassy.com',
      'www.rootsandradishes.com',
      'www.marthastewart.com'
    ],
  },
}

module.exports = nextConfig
