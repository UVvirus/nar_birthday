export type BotanicalMotif =
  | 'peony'
  | 'lavender'
  | 'eucalyptus'
  | 'peach-blossom'
  | 'forget-me-not';

export type CardIllustrationKind =
  | 'smile'
  | 'craziness'
  | 'fighter'
  | 'little-things'
  | 'narmadha';

export type EasterEggKind = 'halwa' | 'office' | 'project' | 'certificate';

export interface AppreciationCardItem {
  id: string;
  title: string;
  /** Short evocative subtitle revealed when the letter opens */
  message: string;
  /** Full personal unfolded handwritten letter */
  keepsakeNote: string;
  motif: BotanicalMotif;
  illustration: CardIllustrationKind;
  paperTint: string;
  tapeTint: string;
  sealTint: string;
  rotation: number;
  offsetClass: string;
}

export interface EasterEggItem {
  id: string;
  kind: EasterEggKind;
  marginLabel: string;
  title: string;
  body: string;
  footnote?: string;
  isCertificate?: boolean;
  /** Positioning alongside specific card index in the scrapbook margin */
  anchorAfterIndex: number;
  side: 'left' | 'right';
}

export interface BirthdayAssets {
  /** Replaceable 2D portrait illustration or reference photograph */
  portrait2D: string;
  /** True when user replaces the demo portrait with their own custom photo */
  isCustomPortrait: boolean;
  /** Replaceable 3D animated character image */
  character3DImage: string;
  /** Optional pre-rendered 3D character dancing video (.mp4 / .webm) */
  character3DVideo: string | null;
  /** Botanical watercolor backdrop accent for the scrapbook section */
  scrapbookBotanical: string;
  /** Painterly evening birthday cake illustration */
  eveningCake: string;
  /** Optional user-recorded piano audio URL (.mp3 / .wav / .m4a) */
  customAudioUrl: string | null;
  /** Display name for the piano soundtrack */
  audioTrackTitle: string;
  audioTrackSubtitle: string;
}

export interface BirthdayContentConfig {
  recipientName: string;
  openingTitle: string;
  openingSubtitle: string;
  section1: {
    chapterLabel: string;
    message: string;
    scrollPrompt: string;
  };
  section2: {
    chapterLabel: string;
    heading: string;
    message: string;
    footnote: string;
  };
  section3: {
    chapterLabel: string;
    heading: string;
    subheading: string;
    cards: AppreciationCardItem[];
    easterEggs: EasterEggItem[];
  };
  hiddenEnvelope: {
    teaserLabel: string;
    unlockedTeaserLabel: string;
    salutation: string;
    body: string[];
    signOff: string;
  };
  section4: {
    chapterLabel: string;
    wishBody: string;
    closingHeadline: string;
    wishButtonLabel: string;
    wishMadeMessage: string;
  };
  assets: BirthdayAssets;
}

/**
 * Centralized content & media configuration.
 * Personalized around the real little moments that make Narmadha unmistakably herself.
 */
export const DEFAULT_BIRTHDAY_CONTENT: BirthdayContentConfig = {
  recipientName: 'my special person',
  openingTitle: 'A little birthday story',
  openingSubtitle: 'Best experienced slowly, with the piano playing.',
  section1: {
    chapterLabel: 'Chapter One · A Quiet Sketch',
    message:
      'Some people make the world a little more beautiful just by being in it.',
    scrollPrompt:
      'Just like this little butterfly, may happiness follow you every step of the way.',
  },
  section2: {
    chapterLabel: 'Chapter Two · In Her Element',
    heading: 'Dancing through her own little world',
    message:
      'Today is all about you. Your smile, your craziness, your little quirks and all the things that make you... you.',
    footnote: 'Keep dancing through life just like this, Narmuuu.',
  },
  section3: {
    chapterLabel: 'Chapter Three · Five Little Letters',
    heading: 'Little things I noticed about you',
    subheading: 'Open each folded letter slowly — and keep an eye on the margins.',
    cards: [
      {
        id: 'smile',
        title: 'Your Beautiful Smile',
        message: 'For the moments when your expressions say more than words.',
        keepsakeNote:
          "There's something about the way you smile that makes even an ordinary conversation feel a little less ordinary. Never underestimate the magic of that smile, okay?",
        motif: 'peony',
        illustration: 'smile',
        paperTint: '#FFFDF9',
        tapeTint: 'rgba(236, 197, 206, 0.62)',
        sealTint: '#DCA0B0',
        rotation: -1.6,
        offsetClass: 'md:ml-4 md:mr-auto',
      },
      {
        id: 'craziness',
        title: 'Your certified craziness',
        message: 'The Narmadha who refuses to be normal.',
        keepsakeNote:
          "The random conversations, unexpected reactions, silly moments and that little bit of madness. Honestly, life would be a lot more boring without this version of you. Please don't become normal. Ever.",
        motif: 'peach-blossom',
        illustration: 'craziness',
        paperTint: '#FDF8F4',
        tapeTint: 'rgba(246, 219, 196, 0.72)',
        sealTint: '#D8A88C',
        rotation: 1.7,
        offsetClass: 'md:ml-auto md:mr-6',
      },
      {
        id: 'fighter',
        title: 'The Strength You Carry',
        message: 'For everything you quietly hold together.',
        keepsakeNote:
          "You're expected to understand, adjust, take care of things and sometimes be the strong one even when you need someone to look after you. But remember, Narmuuu, you don't always have to have everything figured out. It's okay to be silly, make mistakes, ask for help and let someone take care of you too. You deserve that just as much.",
        motif: 'eucalyptus',
        illustration: 'fighter',
        paperTint: '#F9FBF8',
        tapeTint: 'rgba(180, 200, 180, 0.62)',
        sealTint: '#8EA990',
        rotation: -1.2,
        offsetClass: 'md:ml-12 md:mr-auto',
      },
      {
        id: 'little-things',
        title: 'The little things you do',
        message: 'For those thoughtful gestures you might not even realise matter.',
        keepsakeNote:
          "Sometimes it's the smallest things that stay with people. Like remembering the smallest detail, sharing something from home, or checking in at just the right time. Those little gestures say a lot about you.",
        motif: 'lavender',
        illustration: 'little-things',
        paperTint: '#FAF8FD',
        tapeTint: 'rgba(213, 200, 232, 0.66)',
        sealTint: '#A994C7',
        rotation: 1.4,
        offsetClass: 'md:ml-auto md:mr-10',
      },
      {
        id: 'narmadha',
        title: 'Simply being Narmadha',
        message: 'For everything you carry quietly — and the grace you show doing it.',
        keepsakeNote:
          "Being the elder daughter isn't always easy. Somewhere along the way, you learn to be responsible, to understand things, to look after others and sometimes put their needs before your own. People might see how well you handle things, but they may not always notice how much you carry. Just remember, you don't always have to be the strong one. You deserve to be taken care of, too.",
        motif: 'forget-me-not',
        illustration: 'narmadha',
        paperTint: '#FFFDF9',
        tapeTint: 'rgba(236, 197, 206, 0.56)',
        sealTint: '#C898AD',
        rotation: -0.9,
        offsetClass: 'md:mx-auto',
      },
    ],
    easterEggs: [
      {
        id: 'narmuuu-effect',
        kind: 'office',
        marginLabel: 'desk note',
        title: 'The Narmuuu Effect',
        body: 'Scientifically observed phenomenon: how one person can effortlessly turn a quiet, boring office day into an unpredictable collection of random conversations and spontaneous laughs.',
        footnote: 'Side effects include losing track of time.',
        anchorAfterIndex: 1,
        side: 'left',
      },
      {
        id: 'project-girl',
        kind: 'project',
        marginLabel: 'margin doodle',
        title: 'The Project Girl',
        body: 'A small note of respect for how seriously you take the things you care about. When you decide something matters, you show up with full focus and refuse to do it halfway.',
        footnote: 'Noticed more than you probably realise.',
        anchorAfterIndex: 2,
        side: 'right',
      },
      {
        id: 'halwa-moment',
        kind: 'halwa',
        marginLabel: 'sweet parcel',
        title: 'The Halwa Moment',
        body: 'Proof that even something simple brought back from your hometown can quietly become one of the most memorable gestures. Some thoughtfulness really does stay with people.',
        footnote: 'Still undefeated.',
        anchorAfterIndex: 3,
        side: 'left',
      },
      {
        id: 'idiot-certificate',
        kind: 'certificate',
        marginLabel: 'official seal',
        title: 'Certificate of Authenticity',
        body: 'Officially certified: 100% adorable, 200% intelligent, and 300% idiot.',
        footnote: 'Awarded to Narmadha · Valid forever · Strictly non-refundable',
        isCertificate: true,
        anchorAfterIndex: 4,
        side: 'right',
      },
    ],
  },
  hiddenEnvelope: {
    teaserLabel: 'Read all 5 letters to unseal the final note',
    unlockedTeaserLabel: 'All 5 opened — tap to unseal your final note',
    salutation: 'Since you read all five, Narmuuu…',
    body: [
      'None of these were written just to sound poetic — they are simply the real, everyday things you bring into a room without even trying.',
      'A little reminder that the world is a more interesting place with a Narmadha in it.',
    ],
    signOff: 'Happy Birthday, Narmuuu!',
  },
  section4: {
    chapterLabel: 'Chapter Four · Under Evening Stars',
    wishBody:
      'I hope this year brings you countless reasons to smile, good days worth remembering, and everything your heart wishes for.',
    closingHeadline: 'Happy Birthday, Narmuuu!',
    wishButtonLabel: 'Make a wish',
    wishMadeMessage: 'May every quiet wish find its way to you, Narmuuu.',
  },
  assets: {
    portrait2D: '/src/assets/images/portrait_full_hd_1795145835089.jpg',
    isCustomPortrait: true,
    character3DImage: '/src/assets/images/her_3d_garden_character_1795145164310.jpg',
    character3DVideo: '/assets/aistudio/kling_20261116_VIDEO_Use_the_up_3121_0_8199dca6.mp4',
    scrapbookBotanical: '/src/assets/images/botanical_scrapbook_art_1795142845126.jpg',
    eveningCake: '/src/assets/images/evening_birthday_cake_1795142845799.jpg',
    customAudioUrl: null,
    audioTrackTitle: 'Solo Piano Waltz',
    audioTrackSubtitle: 'Swap with your own "Perfect" piano recording anytime',
  },
};
