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
    destinations: {
        'paris.jpg': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
        'dubai.jpg': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop',
        'istanbul.jpg': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=400&fit=crop',
        'maroc.jpg': 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&h=400&fit=crop',
        'mecque.jpg': 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&h=400&fit=crop',
        'medine.jpg': 'https://images.unsplash.com/photo-1591604130107-0c1c1b4f3a1e?w=600&h=400&fit=crop'
    },
    gallery: {
        'gallery1.jpg': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
        'gallery2.jpg': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
        'gallery3.jpg': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=600&fit=crop',
        'gallery4.jpg': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&h=600&fit=crop'
    }
};

async function downloadAllImages() {
    const baseDir = path.join(__dirname, '..', 'public', 'assets', 'images');
    
    for (const [folder, imageList] of Object.entries(images)) {
        const folderPath = path.join(baseDir, folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        for (const [filename, url] of Object.entries(imageList)) {
            const filepath = path.join(folderPath, filename);
            console.log(`Downloading ${filename}...`);
            try {
                await downloadImage(url, filepath);
                console.log(`Downloaded ${filename}`);
            } catch (error) {
                console.error(`Error downloading ${filename}:`, error);
            }
        }
    }
}

downloadAllImages().then(() => {
    console.log('All images downloaded successfully!');
}).catch(error => {
    console.error('Error downloading images:', error);
});
