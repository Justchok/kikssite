const https = require('https');
const fs = require('fs');
const path = require('path');

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

const images = {
    'kikslogo.png': 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
    'paris.jpg': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
    'dubai.jpg': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop',
    'istanbul.jpg': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=400&fit=crop',
    'maroc.jpg': 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&h=400&fit=crop',
    'mecque.jpg': 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&h=400&fit=crop',
    'gallery1.jpg': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
    'gallery2.jpg': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
    'gallery3.jpg': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=600&fit=crop',
    'gallery4.jpg': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&h=600&fit=crop',
    'earth-map.jpg': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop',
    'world-map.jpg': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&h=800&fit=crop'
};

async function downloadAllImages() {
    const imagesDir = path.join(__dirname, '..', 'public', 'assets', 'images');
    
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    for (const [filename, url] of Object.entries(images)) {
        const filepath = path.join(imagesDir, filename);
        console.log(`Downloading ${filename}...`);
        try {
            await downloadImage(url, filepath);
            console.log(`Downloaded ${filename}`);
        } catch (error) {
            console.error(`Error downloading ${filename}:`, error);
        }
    }
}

downloadAllImages().then(() => {
    console.log('All images downloaded successfully!');
}).catch(error => {
    console.error('Error downloading images:', error);
});
