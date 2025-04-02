const USER_IMAGE_SEED_PREFIX = 'user_';
const POST_IMAGE_SEED_PREFIX = 'post_';

export const getRandomUserImageUrl = (userId: string | number): string => {
    const seed = `${USER_IMAGE_SEED_PREFIX}${userId}`;
    return `https://picsum.photos/seed/${seed}/50/50`;
};

export const getRandomPostImageUrl = (postId: string | number): string => {
    const seed = `${POST_IMAGE_SEED_PREFIX}${postId}`;
    return `https://picsum.photos/seed/${seed}/600/400`;
};

export const getRandomImageUrl = (width: number = 200, height: number = 300): string => {
     return `https://picsum.photos/${width}/${height}?random=${Date.now() * Math.random()}`;
}