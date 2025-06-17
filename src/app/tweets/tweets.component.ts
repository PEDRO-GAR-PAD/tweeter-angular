import { Component, OnInit } from '@angular/core';
import { TweetService } from '../services/tweet.service';
import { ReactionService, TweetReaction } from '../services/reaction.service';
import { Reaction } from '../models/reaction.model';
import { Tweet } from '../models/tweets/Tweet';

@Component({
  selector: 'app-tweets',
  templateUrl: './tweets.component.html',
  styleUrl: './tweets.component.css'
})
export class TweetsComponent implements OnInit {
  tweets: Tweet[] = [];
  reactionTypes: Reaction[] = [];
  reactionCounts: { [tweetId: number]: { [desc: string]: number } } = {};
  allReactions: TweetReaction[] = [];

  // Para el nuevo tweet
  tweetText: string = '';

  constructor(
    private tweetService: TweetService,
    private reactionService: ReactionService
  ) {}

  ngOnInit(): void {
    this.loadTweets();
    this.loadAllReactions();
  }

  /** Carga todos los tweets paginados */
  private loadTweets(): void {
    this.tweetService.getTweets().subscribe({
      next: (data: any) => this.tweets = data.content,
      error: err => console.error(err)
    });
  }

  /** Carga todas las reacciones para luego calcular tipos y contadores */
  private loadAllReactions(): void {
    this.reactionService.getAllReactions().subscribe({
      next: page => {
        this.allReactions = page.content;
        this.calculateReactionTypes();
        this.calculateCounts();
      },
      error: err => console.error(err)
    });
  }

  /** Extrae los tipos únicos de reacción */
  private calculateReactionTypes(): void {
    const map = new Map<number, string>();
    this.allReactions.forEach(r => {
      map.set(r.reaction.id, r.reaction.description);
    });
    this.reactionTypes = Array.from(map.entries()).map(
      ([id, description]) => ({ id, description })
    );
  }

  /** Cuenta cuántas reacciones de cada tipo hay por tweet */
  private calculateCounts(): void {
    this.reactionCounts = {};
    this.allReactions.forEach(r => {
      const tId = r.tweet.id;
      const desc = r.reaction.description;
      if (!this.reactionCounts[tId]) {
        this.reactionCounts[tId] = {};
      }
      this.reactionCounts[tId][desc] = (this.reactionCounts[tId][desc] || 0) + 1;
    });
  }

  /** Cuando el usuario hace clic en un botón de reacción */
  react(tweetId: number, reactionId: number): void {
    this.reactionService.createReaction(tweetId, reactionId).subscribe({
      next: () => this.loadAllReactions(),
      error: err => console.error(err)
    });
  }

  /** Envía un nuevo tweet y lo agrega a la lista */
  // En tu método de agregar tweet (tweets.component.ts)
addTweet() {
  this.tweetService.createTweet(this.tweetText).subscribe({
    next: (tweetRealmenteGuardado) => {
      this.tweets.unshift(tweetRealmenteGuardado); // El backend debe regresarte el tweet con su id real!
      this.tweetText = '';
      this.loadAllReactions(); // Opcional si quieres refrescar todo
    },
    error: err => console.error(err)
  });
}

}
