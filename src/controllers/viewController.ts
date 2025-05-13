import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import prisma from "../prismaClient";
import { Prisma } from "@prisma/client";
import { CustomRequest } from "../types/customRequest";
import { catchAsync } from "../utils/catchAsync";

const POSTS_PER_PAGE = 20;

type UserSearchResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    usertag: true;
    bio: true;
    image: true;
    _count: {
      select: {
        followers: true;
        following: true;
      };
    };
  };
}> & { isFollowing?: boolean };

type PostSearchResult = Prisma.PostGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        username: true;
        usertag: true;
        image: true;
      };
    };
    _count: {
      select: {
        likes: true;
        comments: true;
        reposts: true;
      };
    };
    likes: true;
    reposts: true;
  };
}>;

// Helper function to check follow relationship
async function checkFollowStatus(currentUserId: number | undefined, profileUserId: number) {
  if (!currentUserId || currentUserId === profileUserId) return false;

  const followRelationship = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: profileUserId,
      },
    },
  });

  return !!followRelationship;
}

// Alerts
export const alerts = (req: Request, res: Response, next: NextFunction) => {
  const { alert } = req.query;
  if (alert) {
    res.locals.alert = alert;
  }
  next();
};

// Get just one post
export const getPost = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          post: { select: { id: true } },
          user: { select: { id: true, username: true, usertag: true, image: true } },
          _count: { select: { likes: true, reposts: true } },
          likes: { where: { userId: req.user?.id } },
          reposts: { where: { userId: req.user?.id } },
        },
      },
      _count: { select: { likes: true, reposts: true } },
      likes: { where: { userId: req.user?.id } },
      reposts: { where: { userId: req.user?.id } },
    },
  });

  if (!post) {
    return next(new AppError("Post not found", 404, true));
  }
  res.status(200).render("post", { title: "Post", post, reqUser: req.user });
});

// Get all post on the home page
export const getHome = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const posts = await prisma.post.findMany({
    take: POSTS_PER_PAGE,
    include: {
      user: { select: { id: true, username: true, usertag: true, image: true } },
      _count: { select: { likes: true, comments: true, reposts: true } },
      likes: { where: { userId: req.user?.id } },
      reposts: { where: { userId: req.user?.id } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const lastPostId = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;

  res.status(200).render("feed", { title: "Feed", posts, reqUser: req.user, lastPostId, filterType: "all" });
});

// Get all post on the home page from followed accounts
export const getHomeFollowing = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const currentUserId = req.user?.id;

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const posts = await prisma.post.findMany({
    take: POSTS_PER_PAGE,
    where: {
      user: {
        followers: {
          some: {
            followerId: currentUserId,
          },
        },
      },
    },
    include: {
      user: { select: { id: true, username: true, usertag: true, image: true } },
      _count: { select: { likes: true, comments: true, reposts: true } },
      likes: { where: { userId: currentUserId } },
      reposts: { where: { userId: currentUserId } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const lastPostId = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;

  res.status(200).render("feed", {
    title: "Feed",
    posts,
    reqUser: req.user,
    lastPostId,
    filterType: "following",
  });
});

// Get more posts for the feed
export const getMorePosts = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
  const filter = req.query.filter;

  if (!cursor) {
    return res.status(200).json({ status: "success", data: { posts: [], nextCursor: null } });
  }

  const currentUserId = req.user?.id;

  let whereClause: Prisma.PostWhereInput = {};
  if (filter === "following" && currentUserId) {
    whereClause = {
      user: {
        followers: {
          some: {
            followerId: currentUserId,
          },
        },
      },
    };
  }

  const posts = await prisma.post.findMany({
    take: POSTS_PER_PAGE,
    skip: 1,
    cursor: { id: cursor },
    where: whereClause,
    include: {
      user: { select: { id: true, username: true, usertag: true, image: true } },
      _count: { select: { likes: true, comments: true, reposts: true } },
      likes: { where: { userId: currentUserId } },
      reposts: { where: { userId: currentUserId } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const nextCursor = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;

  res.status(200).json({
    status: "success",
    data: {
      posts,
      nextCursor,
    },
  });
});

// Get more posts for the profile
export const getMoreProfilePosts = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.userId);
  const currentUserId = req.user?.id;
  const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

  if (!cursor) {
    return res.status(200).json({
      status: "success",
      data: { posts: [], nextCursor: null },
    });
  }

  const posts = await prisma.post.findMany({
    where: {
      userId: profileUserId,
    },
    take: POSTS_PER_PAGE,
    skip: 1,
    cursor: { id: cursor },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: { select: { id: true, username: true, usertag: true, image: true } },
      _count: { select: { likes: true, comments: true, reposts: true } },
      likes: { where: { userId: currentUserId } },
      reposts: { where: { userId: currentUserId } },
    },
  });

  const nextCursor = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;

  res.status(200).json({
    status: "success",
    data: {
      posts,
      nextCursor,
    },
  });
});
// Get more posts for the profile
export const getMoreProfileComments = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.userId);
  const currentUserId = req.user?.id;
  const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

  if (!profileUserId) {
    return next(new AppError("No profile ID found", 400, true));
  }

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  if (!cursor) {
    return res.status(200).json({
      status: "success",
      data: { posts: [], nextCursor: null },
    });
  }

  const comments = await prisma.comment.findMany({
    where: {
      userId: profileUserId,
    },
    take: POSTS_PER_PAGE,
    skip: 1,
    cursor: { id: cursor },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: { select: { id: true, username: true, usertag: true, image: true } },
      post: { select: { id: true, user: { select: { username: true, usertag: true } } } },
      _count: { select: { likes: true } },
      likes: { where: { userId: currentUserId } },
      reposts: { where: { userId: currentUserId } },
    },
  });

  if (!comments) {
    return next(new AppError("No comments found", 404, true));
  }

  const nextCursor = comments.length === POSTS_PER_PAGE ? comments[comments.length - 1].id : null;

  res.status(200).json({
    status: "success",
    data: {
      comments,
      nextCursor,
    },
  });
});

export const getMoreProfileReposts = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.userId);
  const currentUserId = req.user?.id;
  const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

  if (!profileUserId) {
    return next(new AppError("No profile ID found", 400, true));
  }

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  if (!cursor) {
    return res.status(200).json({
      status: "success",
      data: { posts: [], nextCursor: null },
    });
  }

  const reposts = await prisma.postRepost.findMany({
    where: {
      userId: profileUserId,
    },
    take: POSTS_PER_PAGE,
    skip: 1,
    cursor: { id: cursor },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: { select: { id: true, username: true, usertag: true, image: true } },
      post: {
        select: {
          id: true,
          text: true,
          image: true,
          user: { select: { username: true, usertag: true } },
          _count: { select: { likes: true, reposts: true, comments: true } },
          likes: { where: { userId: currentUserId } },
          reposts: { where: { userId: currentUserId } },
        },
      },
    },
  });

  if (!reposts) {
    return res.status(400).json({
      status: "error",
      message: "No reposts found",
    });
  }

  const nextCursor = reposts.length === POSTS_PER_PAGE ? reposts[reposts.length - 1].id : null;

  res.status(200).json({
    status: "success",
    data: {
      reposts,
      nextCursor,
    },
  });
});

export const getMoreProfileLikes = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.userId);
  const currentUserId = req.user?.id;
  const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

  if (!profileUserId) {
    return next(new AppError("No profile ID found", 400, true));
  }

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  if (!cursor) {
    return res.status(200).json({
      status: "success",
      data: { likes: [], nextCursor: null },
    });
  }

  // Fetch both post likes and comment likes
  const [postLikes, commentLikes] = await Promise.all([
    prisma.postLike.findMany({
      where: {
        userId: profileUserId,
        id: { lt: cursor },
      },
      take: POSTS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            user: { select: { id: true, username: true, usertag: true, image: true } },
            likes: { where: { userId: currentUserId } },
            reposts: { where: { userId: currentUserId } },
            _count: {
              select: { likes: true, reposts: true, comments: true },
            },
          },
        },
      },
    }),
    prisma.commentLike.findMany({
      where: {
        userId: profileUserId,
        id: { lt: cursor },
      },
      take: POSTS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        comment: {
          include: {
            likes: { where: { userId: currentUserId } },
            user: { select: { id: true, username: true, usertag: true, image: true } },
            post: {
              select: {
                id: true,
                text: true,
                createdAt: true,
                user: { select: { id: true, username: true, usertag: true } },
              },
            },
            _count: {
              select: { likes: true, reposts: true },
            },
          },
        },
      },
    }),
  ]);

  // Combine and sort likes
  const allLikes = [
    ...postLikes.map((like) => ({ ...like, type: "post" })),
    ...commentLikes.map((like) => ({ ...like, type: "comment" })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, POSTS_PER_PAGE);

  const nextCursor = allLikes.length === POSTS_PER_PAGE ? allLikes[allLikes.length - 1].id : null;

  res.status(200).json({
    status: "success",
    data: {
      likes: allLikes,
      nextCursor,
    },
  });
});

// Get the messages page
export const getMessages = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.user?.id);

  if (!userId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              usertag: true,
              image: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  res.status(200).render("messages", {
    title: "Messages",
    reqUser: req.user,
    conversations,
    activeConversation: null,
  });
});

export const getConversation = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.user?.id);
  const conversationId = Number(req.params.conversationId);

  if (!conversationId) {
    return next(new AppError("No conversation found", 404, true));
  }

  if (!userId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const activeConversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              usertag: true,
              image: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: true },
      },
    },
  });

  const otherParticipant = activeConversation?.participants.find((p) => p.user.id !== userId)?.user;

  if (!activeConversation) {
    return next(new AppError("Conversation not found", 404, true));
  }

  // Check if user is a participant
  const isParticipant = activeConversation.participants.some((p) => p.user.id === userId);
  if (!isParticipant) {
    return next(new AppError("Access denied", 403, true));
  }

  // Fetch all conversations for sidebar
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, username: true, usertag: true, image: true },
          },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  res.status(200).render("messages", {
    title: "Messages",
    reqUser: req.user,
    conversations,
    activeConversation,
    otherParticipant,
  });
});

export const startConversation = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.user?.id);
  const targetUserId = Number(req.body.targetUserId);

  if (!targetUserId) {
    return next(new AppError("No target ID found", 400, true));
  }

  if (!userId) {
    return next(new AppError("Authentication required", 401, true));
  }

  if (userId === targetUserId) {
    return next(new AppError("You cannot message yourself", 400, true));
  }
  // Find conversation with both participants
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: targetUserId } } },
        { participants: { every: { userId: { in: [userId, targetUserId] } } } },
      ],
    },
    include: {
      participants: true,
    },
  });

  if (existingConversation) {
    return res.status(200).json({
      status: "success",
      data: { conversation: existingConversation },
    });
  }

  // Create conversation with both participants
  const newConversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: targetUserId }],
      },
    },
    include: {
      participants: true,
    },
  });

  res.status(201).json({
    status: "success",
    data: { conversation: newConversation },
  });
});

// Get notifications
export const getNotifications = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const notifications = await prisma.notification.findMany({
    where: {
      recipientId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sender: {
        select: { id: true, username: true, usertag: true, image: true },
      },
      post: { select: { id: true, text: true } },
      comment: { select: { id: true, text: true } },
      conversation: { select: { id: true } },
    },
    take: 30, // Limit the number of notifications
  });

  const unreadCount = await prisma.notification.count({
    where: {
      recipientId: userId,
      read: false,
    },
  });

  res.status(200).render("notifications", { title: "Notifications", notifications, unreadCount, reqUser: req.user });
});

// Search for posts and users
export const search = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { q, type = "all" } = req.query;
  const query = typeof q === "string" ? q.trim() : "";
  const currentUserId = req.user?.id;

  if (!query) {
    return res.status(200).render("search", {
      title: "Search",
      query: "",
      results: { users: [], posts: [] },
      type: type as string,
      reqUser: req.user,
    });
  }

  // Create search objects for different result types
  let users: UserSearchResult[] = [];
  let posts: PostSearchResult[] = [];

  // Search based on the requested type
  if (type === "all" || type === "users") {
    users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { usertag: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        usertag: true,
        bio: true,
        image: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
      take: 20,
    });

    // Check if current user is following each user in results
    if (currentUserId) {
      users = await Promise.all(
        users.map(async (user): Promise<UserSearchResult> => {
          const isFollowing = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: user.id,
              },
            },
          });
          return {
            ...user,
            isFollowing: !!isFollowing,
          };
        })
      );
    }
  }

  if (type === "all" || type === "posts") {
    posts = await prisma.post.findMany({
      where: {
        text: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            usertag: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
        likes: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
            }
          : false,
        reposts: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });
  }

  res.status(200).render("search", {
    title: `Search: ${query}`,
    query,
    results: { users, posts },
    type: type as string,
    reqUser: req.user,
  });
});

// Get the profile page
export const getProfile = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return next(new AppError("No profile ID found", 400, true));
  }

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const profileUser = await prisma.user.findUnique({
    where: { id: profileUserId },
    include: {
      posts: {
        // Fetch posts for the feed
        orderBy: { createdAt: "desc" },
        include: {
          reposts: {
            where: {
              userId: currentUserId ?? -1,
            },
          },
          likes: {
            where: {
              userId: currentUserId ?? -1,
            },
            select: { id: true },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              reposts: true,
            },
          },
        },
        take: POSTS_PER_PAGE,
      },
      // Get the profile user follower/following counts
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!profileUser) {
    return next(new AppError("User not found", 404, true));
  }

  let isCurrentUserFollowing = false;
  if (currentUserId && currentUserId !== profileUserId) {
    const followRelationship = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: profileUserId,
        },
      },
      select: {
        id: true,
      },
    });

    isCurrentUserFollowing = !!followRelationship;
  } else if (currentUserId && currentUserId === profileUserId) {
    isCurrentUserFollowing = false;
  }

  const lastPostId =
    profileUser.posts.length === POSTS_PER_PAGE ? profileUser.posts[profileUser.posts.length - 1].id : null;

  res.status(200).render("profile", {
    title: `${profileUser.username} Profile`,
    user: profileUser,
    reqUser: req.user,
    isCurrentUserFollowing,
    lastPostId,
  });
});

// Get the profile comments page
export const getProfileComments = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return next(new AppError("No profile ID found", 400, true));
  }

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(profileUserId) },
    include: {
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          likes: {
            where: {
              userId: req.user?.id,
            },
          },
          _count: {
            select: {
              likes: true,
              reposts: true,
            },
          },
          post: {
            select: {
              id: true,
              text: true,
              createdAt: true,
              user: { select: { id: true, username: true, usertag: true, image: true } },
              likes: true,
            },
          },
        },
        take: POSTS_PER_PAGE,
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404, true));
  }

  const isCurrentUserFollowing = await checkFollowStatus(currentUserId, profileUserId);
  const lastPostId = user.comments.length === POSTS_PER_PAGE ? user.comments[user.comments.length - 1].id : null;
  res
    .status(200)
    .render("profileComments", { title: "Profile", user, reqUser: req.user, isCurrentUserFollowing, lastPostId });
});

// Get the profile likes page
export const getProfileLikes = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return next(new AppError("No profile ID found", 400, true));
  }

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(profileUserId) },
    include: {
      postLikes: {
        orderBy: { createdAt: "desc" },
        include: {
          post: {
            include: {
              likes: {
                where: {
                  userId: currentUserId ?? -1,
                },
              },
              reposts: {
                where: {
                  userId: currentUserId ?? -1,
                },
              },
              user: { select: { id: true, username: true, usertag: true, image: true } },
              _count: {
                select: {
                  likes: true,
                  reposts: true,
                  comments: true,
                },
              },
            },
          },
        },
        take: POSTS_PER_PAGE,
      },
      commentLikes: {
        orderBy: { createdAt: "desc" },
        include: {
          comment: {
            include: {
              likes: { where: { userId: currentUserId ?? -1 } },
              user: { select: { id: true, username: true, usertag: true, image: true } },
              post: {
                select: {
                  likes: { where: { userId: currentUserId ?? -1 } },
                  id: true,
                  text: true,
                  createdAt: true,
                  user: { select: { id: true, username: true, usertag: true } },
                },
              },
              _count: {
                select: {
                  likes: true,
                  reposts: true,
                },
              },
            },
          },
        },
        take: POSTS_PER_PAGE,
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404, true));
  }

  // Combine post likes and comment likes into a single array
  const allLikes = [
    ...user.postLikes.map((like) => ({
      ...like,
      type: "post",
      createdAt: like.createdAt,
      id: like.id,
    })),
    ...user.commentLikes.map((like) => ({
      ...like,
      type: "comment",
      createdAt: like.createdAt,
      id: like.id,
    })),
  ];

  // Sort combined likes by createdAt in descending order
  allLikes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Take only POSTS_PER_PAGE items
  const paginatedLikes = allLikes.slice(0, POSTS_PER_PAGE);

  const lastPostId = paginatedLikes.length === POSTS_PER_PAGE ? paginatedLikes[paginatedLikes.length - 1].id : null;

  const isCurrentUserFollowing = await checkFollowStatus(currentUserId, profileUserId);

  res.status(200).render("profileLikes", {
    title: "Profile",
    user: {
      ...user,
      allLikes: paginatedLikes, // Add the combined and sorted likes to the user object
    },
    reqUser: req.user,
    isCurrentUserFollowing,
    lastPostId,
  });
});

// Get the profile reposts page
export const getProfileReposts = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return next(new AppError("No profile ID found", 400, true));
  }

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(profileUserId) },
    include: {
      postReposts: {
        orderBy: { createdAt: "desc" },
        include: {
          post: {
            include: {
              user: { select: { id: true, username: true, usertag: true, image: true } },
              likes: {
                where: {
                  userId: profileUserId ?? -1,
                },
              },
              reposts: {
                where: {
                  userId: profileUserId ?? -1,
                },
              },
              _count: {
                select: {
                  likes: true,
                  reposts: true,
                  comments: true,
                },
              },
            },
          },
        },
        take: POSTS_PER_PAGE,
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404, true));
  }

  const isCurrentUserFollowing = await checkFollowStatus(currentUserId, profileUserId);
  const lastPostId =
    user.postReposts.length === POSTS_PER_PAGE ? user.postReposts[user.postReposts.length - 1].id : null;

  res
    .status(200)
    .render("profileReposts", { title: "Profile", user, reqUser: req.user, isCurrentUserFollowing, lastPostId });
});

// Get the followers page
export const getProfileFollowers = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!userId) {
    return next(new AppError("No profile ID found", 400, true));
  }

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      usertag: true,
      image: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404, true));
  }

  // Get all followers with their details
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          usertag: true,
          image: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Check if the current user is following each follower
  const followersWithFollowStatus = await Promise.all(
    followers.map(async (follow) => ({
      ...follow,
      isFollowing: await checkFollowStatus(currentUserId, follow.follower.id),
    }))
  );

  res.status(200).render("followers", {
    title: `People following ${user.username}`,
    user,
    followers: followersWithFollowStatus,
    reqUser: req.user,
  });
});

// Get the following page
export const getProfileFollowing = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!userId) {
    return next(new AppError("No profile ID found", 400, true));
  }

  if (!currentUserId) {
    return next(new AppError("Authentication required", 401, true));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      usertag: true,
      image: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404, true));
  }

  // Get all users that this user is following
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          usertag: true,
          image: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Check if the current user is following each of these users
  const followingWithFollowStatus = await Promise.all(
    following.map(async (follow) => ({
      ...follow,
      isFollowing: await checkFollowStatus(currentUserId, follow.following.id),
    }))
  );

  res.status(200).render("following", {
    title: `People followed by ${user.username}`,
    user,
    following: followingWithFollowStatus,
    reqUser: req.user,
  });
});

export const getWelcome = (req: Request, res: Response) => {
  res.status(200).render("index", { title: "Welcome" });
};

export const getLoginForm = (req: Request, res: Response) => {
  res.status(200).render("login", { title: "Login" });
};

export const getRegisterForm = (req: Request, res: Response) => {
  res.status(200).render("register", { title: "Register" });
};

// About page
export const getAbout = (req: Request, res: Response) => {
  res.status(200).render("about", {
    title: "About Us",
  });
};

// Terms page
export const getTerms = (req: Request, res: Response) => {
  res.status(200).render("terms", {
    title: "Terms, Privacy, and Cookies",
  });
};
