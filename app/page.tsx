"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  PenTool,
  RotateCcw,
  Send,
  Palette,
  Heart,
  MessageCircle,
  Share,
  User,
  Clock,
  UserPlus,
  UserCheck,
  Settings,
  Home,
  Edit3,
  Save,
  ArrowLeft,
  Monitor,
} from "lucide-react"

interface HandwrittenLetter {
  id: string
  imageData: string
  timestamp: number
}

interface Post {
  id: string
  letters: HandwrittenLetter[]
  frameColor: string
  frameStyle: string
  author: string
  timestamp: number
  likes: number
  comments: number
  shares: number
}

interface FrameStyle {
  id: string
  name: string
  borderRadius: string
  borderStyle: string
  borderWidth: string
  shadow: string
}

interface UserProfile {
  username: string
  bio: string
  joinDate: number
  postsCount: number
  followersCount: number
  followingCount: number
}

type ViewMode = "feed" | "profile" | "settings" | "user-profile"

export default function HandwrittenSNS() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentLetters, setCurrentLetters] = useState<HandwrittenLetter[]>([])
  const [selectedFrameColor, setSelectedFrameColor] = useState("#164e63")
  const [selectedFrameStyle, setSelectedFrameStyle] = useState("classic")
  const [showFrameSelector, setShowFrameSelector] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [penColor, setPenColor] = useState("#164e63")
  const [penSize, setPenSize] = useState(3)
  const [animatingPosts, setAnimatingPosts] = useState<Set<string>>(new Set())
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [sharedPosts, setSharedPosts] = useState<Set<string>>(new Set())
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<ViewMode>("feed")
  const [viewingUser, setViewingUser] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isMobile, setIsMobile] = useState(true)

  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: "You",
    bio: "Expressing myself through handwritten letters ✍️",
    joinDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    postsCount: 0,
    followersCount: 5,
    followingCount: 3,
  })

  const [editingProfile, setEditingProfile] = useState<UserProfile>(userProfile)

  const frameColors = ["#164e63", "#10b981", "#dc2626", "#7c3aed", "#ea580c"]

  const frameStyles: FrameStyle[] = [
    {
      id: "classic",
      name: "Classic",
      borderRadius: "0.5rem",
      borderStyle: "solid",
      borderWidth: "3px",
      shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    },
    {
      id: "rounded",
      name: "Rounded",
      borderRadius: "1.5rem",
      borderStyle: "solid",
      borderWidth: "3px",
      shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    },
    {
      id: "vintage",
      name: "Vintage",
      borderRadius: "0.25rem",
      borderStyle: "double",
      borderWidth: "6px",
      shadow: "0 8px 25px -5px rgb(0 0 0 / 0.1)",
    },
    {
      id: "modern",
      name: "Modern",
      borderRadius: "0rem",
      borderStyle: "solid",
      borderWidth: "2px",
      shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    },
    {
      id: "artistic",
      name: "Artistic",
      borderRadius: "2rem 0.5rem 2rem 0.5rem",
      borderStyle: "dashed",
      borderWidth: "3px",
      shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    },
  ]

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const containerWidth = Math.min(window.innerWidth - 64, 320) // Account for padding
    const canvasSize = Math.min(containerWidth - 48, 280) // Account for card padding

    canvas.width = canvasSize
    canvas.height = canvasSize

    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = penColor
    ctx.lineWidth = penSize
  }, [penColor, penSize, isMobile])

  useEffect(() => {
    const samplePosts: Post[] = [
      {
        id: "sample1",
        letters: [
          { id: "1", imageData: "/handwritten-letter-h.jpg", timestamp: Date.now() },
          { id: "2", imageData: "/handwritten-letter-e.jpg", timestamp: Date.now() },
          { id: "3", imageData: "/handwritten-letter-l.jpg", timestamp: Date.now() },
          { id: "4", imageData: "/handwritten-letter-l.jpg", timestamp: Date.now() },
          { id: "5", imageData: "/handwritten-letter-o.jpg", timestamp: Date.now() },
        ],
        frameColor: "#10b981",
        frameStyle: "rounded",
        author: "Alice",
        timestamp: Date.now() - 3600000,
        likes: 12,
        comments: 3,
        shares: 2,
      },
      {
        id: "sample2",
        letters: [
          { id: "6", imageData: "/handwritten-letter-a.jpg", timestamp: Date.now() },
          { id: "7", imageData: "/handwritten-letter-r.jpg", timestamp: Date.now() },
          { id: "8", imageData: "/handwritten-letter-t.jpg", timestamp: Date.now() },
        ],
        frameColor: "#7c3aed",
        frameStyle: "vintage",
        author: "Bob",
        timestamp: Date.now() - 7200000,
        likes: 8,
        comments: 1,
        shares: 0,
      },
    ]

    if (posts.length === 0) {
      setPosts(samplePosts)
    }
  }, [posts.length])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ("touches" in e) {
      e.preventDefault()
    }

    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    if ("touches" in e) {
      e.preventDefault()
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveCurrentLetter = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL()
    const newLetter: HandwrittenLetter = {
      id: Date.now().toString(),
      imageData,
      timestamp: Date.now(),
    }

    setCurrentLetters((prev) => [...prev, newLetter])
    clearCanvas()
  }

  const submitPost = () => {
    if (currentLetters.length === 0) return

    const newPost: Post = {
      id: Date.now().toString(),
      letters: currentLetters,
      frameColor: selectedFrameColor,
      frameStyle: selectedFrameStyle,
      author: userProfile.username,
      timestamp: Date.now(),
      likes: 0,
      comments: 0,
      shares: 0,
    }

    setPosts((prev) => [newPost, ...prev])
    setCurrentLetters([])
    setShowFrameSelector(false)

    setUserProfile((prev) => ({ ...prev, postsCount: prev.postsCount + 1 }))
  }

  const getFrameStyle = (styleId: string) => {
    return frameStyles.find((style) => style.id === styleId) || frameStyles[0]
  }

  const applyFrameStyle = (frameStyleId: string, frameColor: string) => {
    const style = getFrameStyle(frameStyleId)
    return {
      borderColor: frameColor,
      borderWidth: style.borderWidth,
      borderStyle: style.borderStyle,
      borderRadius: style.borderRadius,
      boxShadow: style.shadow,
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "now"
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  const handleLike = (postId: string) => {
    const isLiked = likedPosts.has(postId)

    if (isLiked) {
      setLikedPosts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post)),
      )
    } else {
      setLikedPosts((prev) => new Set([...prev, postId]))
      setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
    }
  }

  const handleFollow = (author: string) => {
    const isFollowing = followedUsers.has(author)

    if (isFollowing) {
      setFollowedUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(author)
        return newSet
      })
      setUserProfile((prev) => ({ ...prev, followingCount: Math.max(0, prev.followingCount - 1) }))
    } else {
      setFollowedUsers((prev) => new Set([...prev, author]))
      setUserProfile((prev) => ({ ...prev, followingCount: prev.followingCount + 1 }))
    }
  }

  const handleShare = (postId: string, method: string) => {
    setSharedPosts((prev) => new Set([...prev, postId]))
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)))
    setShowShareMenu(null)

    console.log(`[v0] Shared post ${postId} via ${method}`)
  }

  const handleComment = (postId: string) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, comments: post.comments + 1 } : post)))
    console.log(`[v0] Added comment to post ${postId}`)
  }

  const animateLetters = (postId: string) => {
    setAnimatingPosts((prev) => new Set([...prev, postId]))
    setTimeout(() => {
      setAnimatingPosts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }, 3000)
  }

  const getUserAvatarColor = (author: string) => {
    const colors = ["#164e63", "#10b981", "#dc2626", "#7c3aed", "#ea580c"]
    const index = author.length % colors.length
    return colors[index]
  }

  const navigateToProfile = (username?: string) => {
    if (username && username !== userProfile.username) {
      setViewingUser(username)
      setCurrentView("user-profile")
    } else {
      setCurrentView("profile")
    }
  }

  const navigateToSettings = () => {
    setCurrentView("settings")
    setEditingProfile(userProfile)
  }

  const saveProfile = () => {
    setUserProfile(editingProfile)
    setIsEditingProfile(false)
    setCurrentView("profile")
  }

  const getUserPosts = (username: string) => {
    return posts.filter((post) => post.author === username)
  }

  const renderHeader = () => (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {currentView !== "feed" && (
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("feed")} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <h1 className="text-lg sm:text-xl font-bold text-primary">HandScript</h1>
        {!isMobile && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <Monitor className="w-3 h-3" />
            View Only
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant={currentView === "feed" ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentView("feed")}
          className="p-2"
        >
          <Home className="w-4 h-4" />
        </Button>
        <Button
          variant={currentView === "profile" ? "default" : "ghost"}
          size="sm"
          onClick={() => navigateToProfile()}
          className="p-2"
        >
          <User className="w-4 h-4" />
        </Button>
        <Button
          variant={currentView === "settings" ? "default" : "ghost"}
          size="sm"
          onClick={navigateToSettings}
          className="p-2"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  const renderProfile = (username: string = userProfile.username) => {
    const isOwnProfile = username === userProfile.username
    const profileData = isOwnProfile
      ? userProfile
      : {
          username,
          bio: `${username}'s handwritten expressions`,
          joinDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
          postsCount: getUserPosts(username).length,
          followersCount: Math.floor(Math.random() * 50) + 5,
          followingCount: Math.floor(Math.random() * 30) + 3,
        }
    const userPosts = getUserPosts(username)

    return (
      <div className="px-4 pb-8">
        <Card className="p-6 mx-auto max-w-sm mb-6">
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
              style={{ backgroundColor: getUserAvatarColor(username) }}
            >
              <User className="w-10 h-10" />
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">{profileData.username}</h2>
            <p className="text-muted-foreground text-sm mb-4">{profileData.bio}</p>

            <div className="flex justify-center gap-6 mb-4">
              <div className="text-center">
                <div className="font-bold text-foreground">{profileData.postsCount}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground">{profileData.followersCount}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground">{profileData.followingCount}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mb-4">Joined {formatDate(profileData.joinDate)}</div>

            {isOwnProfile ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} className="w-full">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={followedUsers.has(username) ? "default" : "outline"}
                size="sm"
                onClick={() => handleFollow(username)}
                className="w-full"
              >
                {followedUsers.has(username) ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        <div className="max-w-sm mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {isOwnProfile ? "Your Posts" : `${username}'s Posts`}
          </h3>

          {userPosts.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground mb-2">No posts yet</div>
              <div className="text-sm text-muted-foreground">
                {isOwnProfile
                  ? "Start writing your first handwritten message!"
                  : `${username} hasn't posted anything yet.`}
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden transition-all hover:shadow-lg"
                  style={applyFrameStyle(post.frameStyle, post.frameColor)}
                >
                  {/* Post Header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: getUserAvatarColor(post.author) }}
                        onClick={() => navigateToProfile(post.author)}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div
                          className="font-semibold text-card-foreground cursor-pointer hover:text-primary transition-colors"
                          onClick={() => navigateToProfile(post.author)}
                        >
                          {post.author}
                          {followedUsers.has(post.author) && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                              Following
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTime(post.timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Letter Sequence Display */}
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Handwritten message ({post.letters.length} letters)
                      </div>
                      <div
                        className="flex gap-2 overflow-x-auto pb-2 cursor-pointer"
                        onClick={() => animateLetters(post.id)}
                      >
                        {post.letters.map((letter, index) => (
                          <div
                            key={letter.id}
                            className={`relative flex-shrink-0 transition-all duration-300 ${
                              animatingPosts.has(post.id) ? "animate-pulse scale-110" : "hover:scale-105"
                            }`}
                            style={{
                              animationDelay: animatingPosts.has(post.id) ? `${index * 200}ms` : "0ms",
                            }}
                          >
                            <img
                              src={letter.imageData || "/placeholder.svg"}
                              alt={`Letter ${index + 1}`}
                              className="w-16 h-16 border-2 border-background rounded-lg shadow-sm bg-white"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Tap to animate sequence</div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 transition-all ${
                            likedPosts.has(post.id)
                              ? "text-red-500 scale-105"
                              : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                          <span className="font-medium">{post.likes}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleComment(post.id)}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </Button>

                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowShareMenu(showShareMenu === post.id ? null : post.id)}
                            className={`flex items-center gap-2 transition-colors ${
                              sharedPosts.has(post.id) ? "text-green-500" : "text-muted-foreground hover:text-primary"
                            }`}
                          >
                            <Share className="w-4 h-4" />
                            <span>{post.shares}</span>
                          </Button>

                          {showShareMenu === post.id && (
                            <div className="absolute bottom-full left-0 mb-2 bg-popover border border-border rounded-lg shadow-lg p-2 z-10">
                              <div className="flex flex-col gap-1 min-w-32">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShare(post.id, "copy")}
                                  className="justify-start text-xs"
                                >
                                  Copy Link
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleShare(post.id, "message")}
                                  className="justify-start text-xs"
                                >
                                  Send Message
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {post.author !== userProfile.username && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFollow(post.author)}
                            className={`text-xs transition-all ${
                              followedUsers.has(post.author)
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-transparent hover:bg-accent"
                            }`}
                          >
                            {followedUsers.has(post.author) ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3 mr-1" />
                                Follow
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSettings = () => (
    <div className="px-4 pb-8">
      <Card className="p-6 mx-auto max-w-sm">
        <h2 className="text-xl font-bold text-foreground mb-6">Account Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Username</label>
            <Input
              value={editingProfile.username}
              onChange={(e) => setEditingProfile((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
            <Textarea
              value={editingProfile.bio}
              onChange={(e) => setEditingProfile((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell others about yourself..."
              rows={3}
            />
          </div>

          <div className="pt-4 space-y-2">
            <Button onClick={saveProfile} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setCurrentView("profile")} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {renderHeader()}

      {currentView === "feed" && (
        <>
          {/* Writing Area - Only show on mobile */}
          {isMobile && (
            <div className="px-3 sm:px-4 mb-6 sm:mb-8 mt-4 sm:mt-8">
              <Card
                className="p-4 sm:p-6 mx-auto max-w-sm"
                style={applyFrameStyle(selectedFrameStyle, selectedFrameColor)}
              >
                <div className="text-center mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-card-foreground mb-2">Write Your Letter</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Draw each letter, then swipe right to continue
                  </p>
                </div>

                {/* Canvas */}
                <div className="flex justify-center mb-4">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-border rounded-lg bg-white cursor-crosshair touch-none max-w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ touchAction: "none" }}
                  />
                </div>

                {/* Drawing Controls */}
                <div className="flex justify-between items-center mb-4 gap-2">
                  <div className="flex gap-1 sm:gap-2">
                    <Button variant="outline" size="sm" onClick={clearCanvas} className="p-2 bg-transparent">
                      <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPenSize(penSize === 3 ? 6 : 3)}
                      className="p-2"
                    >
                      <PenTool className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFrameSelector(!showFrameSelector)}
                      className={`p-2 ${showFrameSelector ? "bg-accent text-accent-foreground" : ""}`}
                    >
                      <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    {frameColors.map((color) => (
                      <button
                        key={color}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-sm touch-manipulation"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setSelectedFrameColor(color)
                          setPenColor(color)
                        }}
                      />
                    ))}
                  </div>
                </div>

                {showFrameSelector && (
                  <div className="mb-4 p-3 sm:p-4 bg-muted rounded-lg">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3">Choose Frame Style</h3>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {frameStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedFrameStyle(style.id)}
                          className={`p-2 sm:p-3 text-left transition-all touch-manipulation ${
                            selectedFrameStyle === style.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-card hover:bg-accent"
                          }`}
                          style={applyFrameStyle(style.id, selectedFrameColor)}
                        >
                          <div className="text-xs sm:text-sm font-medium">{style.name}</div>
                          <div className="text-xs opacity-75 mt-1">{style.borderStyle} border</div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 sm:mt-4">
                      <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Frame Colors</h4>
                      <div className="flex gap-2">
                        {frameColors.map((color) => (
                          <button
                            key={color}
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 shadow-sm touch-manipulation ${
                              selectedFrameColor === color ? "border-foreground" : "border-white"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSelectedFrameColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={saveCurrentLetter}
                    className="flex-1 bg-transparent text-xs sm:text-sm"
                    variant="outline"
                  >
                    Next Letter →
                  </Button>
                  <Button
                    onClick={submitPost}
                    disabled={currentLetters.length === 0}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Post ↑
                  </Button>
                </div>

                {/* Current Letters Preview */}
                {currentLetters.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">Letters in progress:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {currentLetters.map((letter, index) => (
                        <img
                          key={letter.id}
                          src={letter.imageData || "/placeholder.svg"}
                          alt={`Letter ${index + 1}`}
                          className="w-10 h-10 sm:w-12 sm:h-12 border border-border rounded flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* PC View Only Message */}
          {!isMobile && (
            <div className="px-4 mb-8 mt-8">
              <Card className="p-8 mx-auto max-w-md text-center">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Desktop View Mode</h2>
                <p className="text-muted-foreground mb-4">
                  HandScript is designed for mobile devices. You can view posts here, but posting is only available on
                  mobile.
                </p>
                <p className="text-sm text-muted-foreground">
                  Switch to a mobile device or resize your browser window to start writing handwritten messages.
                </p>
              </Card>
            </div>
          )}

          {/* Posts Feed */}
          <div className="px-3 sm:px-4 pb-6 sm:pb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6 max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Recent Posts</h2>
              <div className="text-xs sm:text-sm text-muted-foreground">{posts.length} posts</div>
            </div>

            <div className="space-y-4 sm:space-y-6 max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
              {posts.length === 0 ? (
                <Card className="p-6 sm:p-8 text-center">
                  <div className="text-muted-foreground mb-2">No posts yet</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {isMobile ? "Write your first handwritten message above!" : "Switch to mobile to start posting!"}
                  </div>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card
                    key={post.id}
                    className="overflow-hidden transition-all hover:shadow-lg relative"
                    style={applyFrameStyle(post.frameStyle, post.frameColor)}
                  >
                    {/* Post Header */}
                    <div className="p-3 sm:p-4 pb-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:scale-105 transition-transform touch-manipulation"
                          style={{ backgroundColor: getUserAvatarColor(post.author) }}
                          onClick={() => navigateToProfile(post.author)}
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-semibold text-card-foreground cursor-pointer hover:text-primary transition-colors truncate"
                            onClick={() => navigateToProfile(post.author)}
                          >
                            {post.author}
                            {followedUsers.has(post.author) && (
                              <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                                Following
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTime(post.timestamp)}
                          </div>
                        </div>
                      </div>

                      {/* Letter Sequence Display */}
                      <div className="mb-4">
                        <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                          Handwritten message ({post.letters.length} letters)
                        </div>
                        <div
                          className="flex gap-2 overflow-x-auto pb-2 cursor-pointer touch-manipulation"
                          onClick={() => animateLetters(post.id)}
                        >
                          {post.letters.map((letter, index) => (
                            <div
                              key={letter.id}
                              className={`relative flex-shrink-0 transition-all duration-300 ${
                                animatingPosts.has(post.id) ? "animate-pulse scale-110" : "hover:scale-105"
                              }`}
                              style={{
                                animationDelay: animatingPosts.has(post.id) ? `${index * 200}ms` : "0ms",
                              }}
                            >
                              <img
                                src={letter.imageData || "/placeholder.svg"}
                                alt={`Letter ${index + 1}`}
                                className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-background rounded-lg shadow-sm bg-white"
                              />
                              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Tap to animate sequence</div>
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-1 sm:gap-2 transition-all p-2 touch-manipulation ${
                              likedPosts.has(post.id)
                                ? "text-red-500 scale-105"
                                : "text-muted-foreground hover:text-red-500"
                            }`}
                          >
                            <Heart
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${likedPosts.has(post.id) ? "fill-current" : ""}`}
                            />
                            <span className="font-medium text-xs sm:text-sm">{post.likes}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-primary transition-colors p-2 touch-manipulation"
                          >
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">{post.comments}</span>
                          </Button>

                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowShareMenu(showShareMenu === post.id ? null : post.id)}
                              className={`flex items-center gap-1 sm:gap-2 transition-colors p-2 touch-manipulation ${
                                sharedPosts.has(post.id) ? "text-green-500" : "text-muted-foreground hover:text-primary"
                              }`}
                            >
                              <Share className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">{post.shares}</span>
                            </Button>

                            {showShareMenu === post.id && (
                              <div className="absolute bottom-full left-0 mb-2 bg-popover border border-border rounded-lg shadow-lg p-2 z-10">
                                <div className="flex flex-col gap-1 min-w-28 sm:min-w-32">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare(post.id, "copy")}
                                    className="justify-start text-xs touch-manipulation"
                                  >
                                    Copy Link
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare(post.id, "message")}
                                    className="justify-start text-xs touch-manipulation"
                                  >
                                    Send Message
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {post.author !== userProfile.username && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFollow(post.author)}
                              className={`text-xs transition-all touch-manipulation ${
                                followedUsers.has(post.author)
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "bg-transparent hover:bg-accent"
                              }`}
                            >
                              {followedUsers.has(post.author) ? (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  <span className="hidden sm:inline">Following</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  <span className="hidden sm:inline">Follow</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Load More */}
            {posts.length > 0 && (
              <div className="text-center mt-6 sm:mt-8">
                <Button
                  variant="outline"
                  className="max-w-sm sm:max-w-md lg:max-w-lg w-full bg-transparent touch-manipulation"
                >
                  Load More Posts
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {currentView === "profile" && renderProfile()}
      {currentView === "user-profile" && viewingUser && renderProfile(viewingUser)}
      {currentView === "settings" && renderSettings()}
    </div>
  )
}
