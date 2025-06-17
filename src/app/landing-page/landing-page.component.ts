import { Component, OnInit } from '@angular/core';
import { TweetService } from '../services/tweet.service';
import { ReactionService, TweetReaction } from '../services/reaction.service';
import { CommentService } from '../services/comment.service';
import { Tweet } from '../models/tweets/Tweet';
import { Reaction } from '../models/reaction.model';
import { Comment } from '../models/comment.model';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  tweets: Tweet[] = [];
  reactionTypes: Reaction[] = [];
  allReactions: TweetReaction[] = [];
  reactionCounts: { [tweetId: number]: { [desc: string]: number } } = {};
  commentsMap: { [tweetId: number]: Comment[] } = {};

  // Solo lectura
  reactionEmojis: { [key: string]: string } = {
    REACTION_LIKE: '👍',
    REACTION_LOVE: '❤️',
    REACTION_HATE: '🤮',
    REACTION_SAD: '😢',
    REACTION_ANGRY: '😡'
  };

  constructor(
    private tweetService: TweetService,
    private reactionService: ReactionService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.loadTweets();
    this.loadReactionTypes();
    this.reloadReactions();
  }

  private loadTweets(): void {
    this.tweetService.getTweets().subscribe({
      next: (page: any) => {
        this.tweets = page.content;
        this.tweets.forEach(t => this.loadComments(t.id));
      },
      error: err => console.error(err)
    });
  }

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
      },
      error: err => console.error(err)
    });
  }

  private calculateCounts(): void {
    this.reactionCounts = {};
    this.allReactions.forEach(r => {
      const tId = r.tweet.id;
      const desc = r.reaction.description;
      this.reactionCounts[tId] = this.reactionCounts[tId] || {};
      this.reactionCounts[tId][desc] = (this.reactionCounts[tId][desc] || 0) + 1;
    });
  }

  private loadComments(tweetId: number): void {
    this.commentService.getCommentsByTweet(tweetId).subscribe({
      next: cmts => this.commentsMap[tweetId] = cmts,
      error: err => console.error(err)
    });
  }
}
