import { Component, OnInit } from '@angular/core';
import { TweetService } from '../services/tweet.service';
import { ReactionService, TweetReaction } from '../services/reaction.service';
import { CommentService } from '../services/comment.service';
import { StorageService } from '../services/storage.service';
import { Tweet } from '../models/tweets/Tweet';
import { Reaction } from '../models/reaction.model';
import { Comment } from '../models/comment.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  username = '';
  tweetText = '';
  tweets: Tweet[] = [];

  // → Reacciones
  reactionTypes: Reaction[] = [];
  allReactions: TweetReaction[] = [];
  reactionCounts: { [tweetId: number]: { [desc: string]: number } } = {};
  userReactions: { [tweetId: number]: number } = {};

  reactionEmojis: { [key: string]: string } = {
    REACTION_LIKE: '👍',
    REACTION_LOVE: '❤️',
    REACTION_HATE: '🤮',
    REACTION_SAD: '😢',
    REACTION_ANGRY: '😡'
  };
  
  // → Comentarios
  commentsMap: { [tweetId: number]: Comment[] } = {};
  newCommentText: { [tweetId: number]: string } = {};

  constructor(
    private tweetService: TweetService,
    private reactionService: ReactionService,
    private commentService: CommentService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.username = this.storage.getSession('username') || '';
    this.loadTweets();
    this.loadReactionTypes();
    this.reloadReactions();
  }

  /** Nuevo tweet */
  addTweet(): void {
    if (!this.tweetText.trim()) return;
    this.tweetService.postTweet(this.tweetText.trim()).subscribe({
      next: () => {
        this.tweetText = '';
        this.loadTweets();
        this.reloadReactions();
      },
      error: err => console.error(err)
    });
  }

  /** Carga tweets y sus comentarios */
  private loadTweets(): void {
    this.tweetService.getTweets().subscribe({
      next: (page: any) => {
        this.tweets = page.content;
        this.tweets.forEach(t => this.loadComments(t.id));
      },
      error: err => console.error(err)
    });
  }

  /** Reacciones */
  private loadReactionTypes(): void {
    this.reactionService.getReactionTypes().subscribe({
      next: types => this.reactionTypes = types,
      error: err => console.error(err)
    });
  }

  private reloadReactions(): void {
    this.reactionService.getAllReactions().subscribe({
      next: page => {
        this.allReactions = page.content;
        this.calculateCounts();
        this.calculateUserReactions();
      },
      error: err => console.error(err)
    });
  }

  private calculateCounts(): void {
    this.reactionCounts = {};
    this.allReactions.forEach(r => {
      const tId = r.tweet.id,
            desc = r.reaction.description;
      this.reactionCounts[tId] = this.reactionCounts[tId] || {};
      this.reactionCounts[tId][desc] = (this.reactionCounts[tId][desc] || 0) + 1;
    });
  }

  private calculateUserReactions(): void {
    this.userReactions = {};
    this.allReactions.forEach(r => {
      if (r.user.username === this.username) {
        this.userReactions[r.tweet.id] = r.reaction.id;
      }
    });
  }

  react(tweetId: number, reactionId: number): void {
    const existing = this.userReactions[tweetId];
    if (!existing) {
      this.reactionService.createReaction(tweetId, reactionId).subscribe(() => this.reloadReactions());
    } else if (existing === reactionId) {
      this.reactionService.deleteReaction(tweetId).subscribe(() => this.reloadReactions());
    } else {
      this.reactionService.updateReaction(tweetId, reactionId).subscribe(() => this.reloadReactions());
    }
  }

  /** Comentarios */
  private loadComments(tweetId: number): void {
    this.commentService.getCommentsByTweet(tweetId).subscribe({
      next: cmts => this.commentsMap[tweetId] = cmts,
      error: err => console.error(err)
    });
  }

  addComment(tweetId: number): void {
    const text = this.newCommentText[tweetId]?.trim();
    if (!text) return;
    this.commentService.createComment(tweetId, text).subscribe({
      next: () => {
        this.newCommentText[tweetId] = '';
        this.loadComments(tweetId);
      },
      error: err => console.error(err)
    });
  }

  removeComment(commentId: number, tweetId: number): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => this.loadComments(tweetId),
      error: err => console.error(err)
    });
  }
}
