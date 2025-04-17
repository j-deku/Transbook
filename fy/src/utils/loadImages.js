// utils/loadImages.js

const loadImage = (path) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            console.log(`Image loaded: ${path}`);
            resolve();
        };
        img.onerror = (error) => {
            console.error(`Error loading image: ${path}`, error);
            resolve(); // Resolve even on failure to prevent blocking
        };
    });
};

const loadAssetsImages = async () => {
    if (sessionStorage.getItem("assetsLoaded")) return; // Skip if already loaded

    const imageModules = import.meta.glob('/src/assets/**/*.{png,jpg,jpeg,webp,gif}');
    const imagePaths = Object.keys(imageModules);

    await Promise.all(imagePaths.map(loadImage));

    sessionStorage.setItem("assetsLoaded", "true"); // Mark as loaded
};

const loadPublicImages = async (paths) => {
    if (sessionStorage.getItem("publicImagesLoaded")) return; // Skip if already loaded

    await Promise.all(paths.map(loadImage));

    sessionStorage.setItem("publicImagesLoaded", "true"); // Mark as loaded
};

export const loadAllImages = async () => {
    await Promise.all([
        loadAssetsImages(),
        loadPublicImages([
            '/to_do_icon2.png',
            '/bus.jpeg',
            '/bus2.jpg',
            '/BusLoaded.jpeg',
            '/busStop.jpeg',
            '/car-budget.jpeg',
            '/customer1.jpeg',
            '/traveler2.jpeg',
            '/driver.jpeg',
            '/driver2.gif',
            '/driver3.jpeg',
            '/driver4.jpeg',
            '/driver5.jpeg',
            '/france.jpeg',
            '/hero-image.webp',
            '/Metro-bus.jpeg',
            '/road-test.jpeg',
            '/transBook_logo_circular.png',
            '/images.jpeg',
            '/lille.jpeg',
            '/lille-city.jpeg',
            '/london.jpeg',
            '/london1.jpeg',

            //cloudinary images
            'https://res.cloudinary.com/dtlewbcwr/image/upload/v1738578921/bus2_uuymls.jpg',
            'https://res.cloudinary.com/dtlewbcwr/image/upload/v1738578921/BusLoaded_w3jinc.jpg',
            'https://res.cloudinary.com/dtlewbcwr/image/upload/v1738630848/Metro-bus_ixkbwa_ksah83.jpg',
            'https://res.cloudinary.com/dtlewbcwr/image/upload/v1738580694/road-test_lysbyr.jpg',
            'https://res.cloudinary.com/dtlewbcwr/image/upload/v1738578925/hero-image_f9tgfy.webp',
        ]),
    ]);

    console.log("All images loaded successfully");
};
