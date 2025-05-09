export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  role: string;
  profilePic?: string;
  coverPhoto?: string;
  friends: string[];
  joinedDate: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  category: "all" | "local" | "hotlist" | "friends";
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'like' | 'comment' | 'mention' | 'event';
  content: string;
  read: boolean;
  timestamp: string;
}

export interface Photo {
  id: string;
  userId: string;
  url: string;
  title?: string;
  description?: string;
  createdAt: string;
  album?: string;
  likes: number;
}

export interface Video {
  id: string;
  userId: string;
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  description?: string;
  duration: string;
  views: number;
  likes: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  ratings: number;
  reviewCount: number;
  inStock: boolean;
}

export interface RelationshipStatus {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

// Update User interface to include relationship status
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string;
  role: string;
  profilePic?: string;
  coverPhoto?: string;
  friends: string[];
  joinedDate: string;
  relationshipStatus?: string;
  relationshipPartners?: string[]; // IDs of users tagged in relationship
}

// Mock users data
export const users: User[] = [
  {
    id: '1',
    username: 'alexjohnson',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    bio: 'Member of HappyKinks community since 2023. I enjoy participating in various community events and discussions.',
    role: 'admin',
    friends: ['2', '3', '4', '5'],
    joinedDate: '2023-01-15'
  },
  {
    id: '2',
    username: 'sephiroth',
    name: 'Sephiroth',
    email: 'sephiroth@example.com',
    bio: 'One-Winged Angel. Seeking the Promised Land.',
    role: 'user',
    friends: ['1', '3'],
    joinedDate: '2023-02-10'
  },
  {
    id: '3',
    username: 'lindalohan',
    name: 'Linda Lohan',
    email: 'linda@example.com',
    bio: 'Yoga enthusiast and spiritual seeker.',
    role: 'user',
    friends: ['1', '2', '5'],
    joinedDate: '2023-03-22'
  },
  {
    id: '4',
    username: 'irinapetrova',
    name: 'Irina Petrova',
    email: 'irina@example.com',
    bio: 'Professional dancer and choreographer.',
    role: 'user',
    friends: ['1'],
    joinedDate: '2023-04-05'
  },
  {
    id: '5',
    username: 'jennieferguson',
    name: 'Jennie Ferguson',
    email: 'jennie@example.com',
    bio: 'Digital artist and content creator.',
    role: 'user',
    friends: ['1', '3'],
    joinedDate: '2023-05-18'
  }
];

// Mock posts data
export const posts: Post[] = [
  {
    id: '1',
    userId: '1',
    content: 'Just joined the HappyKinks community! Looking forward to meeting like-minded people here.',
    likes: 12,
    comments: 5,
    createdAt: '2023-05-15T14:23:00Z',
    category: 'all'
  },
  {
    id: '2',
    userId: '2',
    content: 'Had an amazing time at the community event yesterday. Thanks to everyone who came!',
    images: ['https://picsum.photos/id/237/600/400'],
    likes: 24,
    comments: 8,
    createdAt: '2023-05-14T09:15:00Z',
    category: 'local'
  },
  {
    id: '3',
    userId: '3',
    content: 'Sharing my latest artwork inspired by our community discussions.',
    images: ['https://picsum.photos/id/1025/600/400'],
    likes: 45,
    comments: 12,
    createdAt: '2023-05-13T16:40:00Z',
    category: 'hotlist'
  },
  {
    id: '4',
    userId: '4',
    content: 'Anyone interested in joining the virtual meetup next week? We\'ll be discussing intimacy and communication.',
    likes: 18,
    comments: 7,
    createdAt: '2023-05-12T11:30:00Z',
    category: 'friends'
  },
  {
    id: '5',
    userId: '5',
    content: 'Just published a new blog post on exploring personal boundaries. Link in comments!',
    likes: 32,
    comments: 15,
    createdAt: '2023-05-11T08:20:00Z',
    category: 'all'
  },
  {
    id: '6',
    userId: '1',
    content: 'Starting a new discussion group focused on consent education. DM me if you\'re interested!',
    likes: 29,
    comments: 11,
    createdAt: '2023-05-10T15:45:00Z',
    category: 'local'
  },
  {
    id: '7',
    userId: '2',
    content: 'Thanks everyone for the thoughtful responses to my question about navigating relationships!',
    likes: 15,
    comments: 6,
    createdAt: '2023-05-09T12:10:00Z',
    category: 'hotlist'
  },
  {
    id: '8',
    userId: '3',
    content: 'Sharing some resources on healthy communication in relationships. Hope these help!',
    images: ['https://picsum.photos/id/1062/600/400'],
    likes: 37,
    comments: 9,
    createdAt: '2023-05-08T10:05:00Z',
    category: 'friends'
  }
];

// Mock messages data
export const messages: Message[] = [
  {
    id: '1',
    senderId: '2',
    recipientId: '1',
    content: 'Hey Alex! How are you doing today?',
    timestamp: '2023-05-15T14:30:00Z',
    read: true
  },
  {
    id: '2',
    senderId: '1',
    recipientId: '2',
    content: 'Hi Sephiroth! I\'m good, thanks for asking. How about you?',
    timestamp: '2023-05-15T14:35:00Z',
    read: true
  },
  {
    id: '3',
    senderId: '2',
    recipientId: '1',
    content: 'Doing well! Just wondering if you\'re coming to the community event next week?',
    timestamp: '2023-05-15T14:40:00Z',
    read: true
  },
  {
    id: '4',
    senderId: '1',
    recipientId: '2',
    content: 'Yes, I\'m planning to attend! Looking forward to meeting everyone.',
    timestamp: '2023-05-15T14:45:00Z',
    read: false
  },
  {
    id: '5',
    senderId: '3',
    recipientId: '1',
    content: 'Alex, can you review the workshop proposal I sent you?',
    timestamp: '2023-05-15T15:00:00Z',
    read: false
  },
  {
    id: '6',
    senderId: '4',
    recipientId: '1',
    content: 'Thanks for accepting my friend request!',
    timestamp: '2023-05-14T09:20:00Z',
    read: false
  },
  {
    id: '7',
    senderId: '5',
    recipientId: '1',
    content: 'Hey, just shared a post that might interest you!',
    timestamp: '2023-05-13T11:15:00Z',
    read: false
  },
  {
    id: '8',
    senderId: '1',
    recipientId: '5',
    content: 'Thanks for sharing! I\'ll check it out.',
    timestamp: '2023-05-13T13:45:00Z',
    read: true
  }
];

// Mock notifications data
export const notifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'friend_request',
    content: 'Sephiroth sent you a friend request',
    read: false,
    timestamp: '2023-05-15T14:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'like',
    content: 'Linda Lohan liked your post',
    read: true,
    timestamp: '2023-05-14T13:30:00Z'
  },
  {
    id: '3',
    userId: '1',
    type: 'comment',
    content: 'Irina Petrova commented on your post',
    read: false,
    timestamp: '2023-05-13T09:45:00Z'
  }
];

// Mock photos data
export const photos: Photo[] = [
  {
    id: '1',
    userId: '1',
    url: 'https://picsum.photos/id/1018/600/400',
    title: 'Community Meetup',
    description: 'Photos from our last community meetup',
    createdAt: '2023-05-10T14:00:00Z',
    album: 'Events',
    likes: 24
  },
  {
    id: '2',
    userId: '1',
    url: 'https://picsum.photos/id/1019/600/400',
    title: 'Workshop Session',
    description: 'Leading the communication workshop',
    createdAt: '2023-05-08T11:30:00Z',
    album: 'Workshops',
    likes: 18
  },
  {
    id: '3',
    userId: '1',
    url: 'https://picsum.photos/id/1022/600/400',
    title: 'Art Exhibition',
    description: 'Visited the local art exhibition',
    createdAt: '2023-05-05T15:20:00Z',
    album: 'Personal',
    likes: 32
  },
  {
    id: '4',
    userId: '2',
    url: 'https://picsum.photos/id/1035/600/400',
    title: 'Meditation Session',
    description: 'Morning meditation by the lake',
    createdAt: '2023-05-12T08:15:00Z',
    album: 'Wellness',
    likes: 15
  },
  {
    id: '5',
    userId: '3',
    url: 'https://picsum.photos/id/1039/600/400',
    title: 'Yoga Class',
    description: 'Teaching advanced yoga poses',
    createdAt: '2023-05-11T17:45:00Z',
    album: 'Fitness',
    likes: 29
  },
  {
    id: '6',
    userId: '4',
    url: 'https://picsum.photos/id/1059/600/400',
    title: 'Dance Performance',
    description: 'Contemporary dance showcase',
    createdAt: '2023-05-09T19:30:00Z',
    album: 'Performances',
    likes: 41
  }
];

// Mock videos data
export const videos: Video[] = [
  {
    id: '1',
    userId: '1',
    thumbnailUrl: 'https://picsum.photos/id/1043/600/400',
    videoUrl: 'https://example.com/video1.mp4',
    title: 'Introduction to Consent Education',
    description: 'A comprehensive guide to understanding consent in relationships',
    duration: '15:30',
    views: 1245,
    likes: 89,
    createdAt: '2023-05-05T10:00:00Z'
  },
  {
    id: '2',
    userId: '3',
    thumbnailUrl: 'https://picsum.photos/id/1044/600/400',
    videoUrl: 'https://example.com/video2.mp4',
    title: 'Mindfulness Meditation for Beginners',
    description: 'Learn the basics of mindfulness meditation practice',
    duration: '10:15',
    views: 875,
    likes: 62,
    createdAt: '2023-05-07T14:30:00Z'
  },
  {
    id: '3',
    userId: '4',
    thumbnailUrl: 'https://picsum.photos/id/1045/600/400',
    videoUrl: 'https://example.com/video3.mp4',
    title: 'Contemporary Dance Workshop',
    description: 'Step-by-step guide to contemporary dance moves',
    duration: '25:40',
    views: 1650,
    likes: 124,
    createdAt: '2023-05-09T11:45:00Z'
  },
  {
    id: '4',
    userId: '2',
    thumbnailUrl: 'https://picsum.photos/id/1060/600/400',
    videoUrl: 'https://example.com/video4.mp4',
    title: 'Communication in Relationships',
    description: 'Tips for effective communication with your partner',
    duration: '18:20',
    views: 2034,
    likes: 156,
    createdAt: '2023-05-11T16:15:00Z'
  },
  {
    id: '5',
    userId: '5',
    thumbnailUrl: 'https://picsum.photos/id/1071/600/400',
    videoUrl: 'https://example.com/video5.mp4',
    title: 'Digital Art Creation Process',
    description: 'Behind the scenes of my latest digital artwork',
    duration: '22:10',
    views: 1325,
    likes: 98,
    createdAt: '2023-05-13T13:00:00Z'
  }
];

// Mock products data
export const products: Product[] = [
  {
    id: '1',
    name: 'Intimate Conversations Card Game',
    description: 'A card game designed to facilitate meaningful and intimate conversations between partners.',
    price: 24.99,
    imageUrl: 'https://picsum.photos/id/1033/600/400',
    category: 'Games',
    ratings: 4.8,
    reviewCount: 124,
    inStock: true
  },
  {
    id: '2',
    name: 'Relationship Wellness Journal',
    description: 'A guided journal for couples to reflect on their relationship and set intentions for growth.',
    price: 19.99,
    imageUrl: 'https://picsum.photos/id/1047/600/400',
    category: 'Books',
    ratings: 4.6,
    reviewCount: 98,
    inStock: true
  },
  {
    id: '3',
    name: 'Mindfulness Meditation Cushion',
    description: 'Comfortable cushion designed for meditation practice.',
    price: 39.99,
    imageUrl: 'https://picsum.photos/id/1048/600/400',
    category: 'Wellness',
    ratings: 4.7,
    reviewCount: 85,
    inStock: true
  },
  {
    id: '4',
    name: 'Sustainable Bamboo Massage Oil',
    description: 'Organic, sustainably sourced massage oil with essential oils.',
    price: 29.99,
    imageUrl: 'https://picsum.photos/id/1049/600/400',
    category: 'Wellness',
    ratings: 4.9,
    reviewCount: 112,
    inStock: false
  },
  {
    id: '5',
    name: 'Communication Workshop Access',
    description: 'Digital access to our popular communication workshop series.',
    price: 49.99,
    imageUrl: 'https://picsum.photos/id/1050/600/400',
    category: 'Courses',
    ratings: 4.8,
    reviewCount: 156,
    inStock: true
  },
  {
    id: '6',
    name: 'Boundaries and Consent Guidebook',
    description: 'Comprehensive guide to understanding and setting healthy boundaries.',
    price: 22.99,
    imageUrl: 'https://picsum.photos/id/1073/600/400',
    category: 'Books',
    ratings: 4.7,
    reviewCount: 92,
    inStock: true
  }
];

// Mock relationship status data
export const relationshipStatuses: RelationshipStatus[] = [
  {
    id: '1',
    name: 'Single',
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'In a relationship',
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Married',
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '4',
    name: 'Engaged',
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '5',
    name: 'Polyamorous',
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '6',
    name: 'Open relationship',
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '7',
    name: 'It\'s complicated',
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '8',
    name: 'Casual partners',
    isActive: true,
    createdAt: '2023-01-15T10:00:00Z'
  }
];

// Update mock users data to include relationship status
export const users: User[] = [
  {
    id: '1',
    username: 'alexjohnson',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    bio: 'Member of HappyKinks community since 2023. I enjoy participating in various community events and discussions.',
    role: 'admin',
    friends: ['2', '3', '4', '5'],
    joinedDate: '2023-01-15',
    relationshipStatus: '5', // Polyamorous
    relationshipPartners: ['2', '3'] // In relationship with Sephiroth and Linda
  },
  {
    id: '2',
    username: 'sephiroth',
    name: 'Sephiroth',
    email: 'sephiroth@example.com',
    bio: 'One-Winged Angel. Seeking the Promised Land.',
    role: 'user',
    friends: ['1', '3'],
    joinedDate: '2023-02-10',
    relationshipStatus: '5', // Polyamorous
    relationshipPartners: ['1'] // In relationship with Alex
  },
  {
    id: '3',
    username: 'lindalohan',
    name: 'Linda Lohan',
    email: 'linda@example.com',
    bio: 'Yoga enthusiast and spiritual seeker.',
    role: 'user',
    friends: ['1', '2', '5'],
    joinedDate: '2023-03-22',
    relationshipStatus: '5', // Polyamorous
    relationshipPartners: ['1'] // In relationship with Alex
  },
  {
    id: '4',
    username: 'irinapetrova',
    name: 'Irina Petrova',
    email: 'irina@example.com',
    bio: 'Professional dancer and choreographer.',
    role: 'user',
    friends: ['1'],
    joinedDate: '2023-04-05',
    relationshipStatus: '1' // Single
  },
  {
    id: '5',
    username: 'jennieferguson',
    name: 'Jennie Ferguson',
    email: 'jennie@example.com',
    bio: 'Digital artist and content creator.',
    role: 'user',
    friends: ['1', '3'],
    joinedDate: '2023-05-18',
    relationshipStatus: '2', // In a relationship
    relationshipPartners: [] // Not tagged anyone yet
  }
];

// Helper function to get a user by ID
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Helper function to get a user's posts
export const getUserPosts = (userId: string): Post[] => {
  return posts.filter(post => post.userId === userId);
};

// Helper function to get posts by category
export const getPostsByCategory = (category: "all" | "local" | "hotlist" | "friends"): Post[] => {
  if (category === "all") {
    return [...posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return posts.filter(post => post.category === category)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Helper function to get conversations for a user
export const getUserConversations = (userId: string): {userId: string, lastMessage: Message, unreadCount: number}[] => {
  // Get all users this user has exchanged messages with
  const allMessages = messages.filter(m => m.senderId === userId || m.recipientId === userId);
  
  // Get unique user IDs this user has exchanged messages with
  const conversationUserIds = [...new Set(
    allMessages.map(m => m.senderId === userId ? m.recipientId : m.senderId)
  )];
  
  // For each conversation, get the most recent message and unread count
  return conversationUserIds.map(conversationUserId => {
    const conversationMessages = allMessages.filter(m => 
      (m.senderId === userId && m.recipientId === conversationUserId) || 
      (m.senderId === conversationUserId && m.recipientId === userId)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const lastMessage = conversationMessages[0];
    
    const unreadCount = conversationMessages.filter(m => 
      m.senderId === conversationUserId && !m.read
    ).length;
    
    return {
      userId: conversationUserId,
      lastMessage,
      unreadCount
    };
  });
};

// Helper function to get the messages between two users
export const getConversationMessages = (user1Id: string, user2Id: string): Message[] => {
  return messages.filter(m => 
    (m.senderId === user1Id && m.recipientId === user2Id) || 
    (m.senderId === user2Id && m.recipientId === user1Id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Helper function to get user's notifications
export const getUserNotifications = (userId: string): Notification[] => {
  return notifications.filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Helper function to get user's photos
export const getUserPhotos = (userId: string): Photo[] => {
  return photos.filter(p => p.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Helper function to get user's videos
export const getUserVideos = (userId: string): Video[] => {
  return videos.filter(v => v.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Helper function to get relationship status by ID
export const getRelationshipStatusById = (id: string): RelationshipStatus | undefined => {
  return relationshipStatuses.find(status => status.id === id);
};

// Helper function to get active relationship statuses
export const getActiveRelationshipStatuses = (): RelationshipStatus[] => {
  return relationshipStatuses.filter(status => status.isActive);
};
