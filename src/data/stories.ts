import { Story } from '../types/story';

export const stories: Story[] = [
  {
    id: 'shadows-choice',
    title: 'The Shadow\'s Choice',
    description: 'A mysterious figure offers you three paths in a moonlit forest. Each decision shapes your destiny in unexpected ways.',
    author: 'The Storyteller',
    image: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg?auto=compress&cs=tinysrgb&w=800',
    estimatedTime: 3,
    tags: ['Mystery', 'Fantasy', 'Quick Play'],
    scenes: [
      {
        id: 'scene-1',
        title: 'The Crossroads',
        content: 'You find yourself at a mysterious crossroads deep in an ancient forest. The moon casts long shadows between the trees, and a hooded figure emerges from the darkness. "Choose your path wisely, traveler," they whisper. "Each road leads to a different fate."',
        image: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg?auto=compress&cs=tinysrgb&w=800',
        options: [
          {
            id: 'opt-1-1',
            text: 'Take the left path through the glowing mushrooms',
            nextSceneId: 'scene-2a',
            isDefault: true
          },
          {
            id: 'opt-1-2',
            text: 'Follow the right path toward distant lights',
            nextSceneId: 'scene-2b'
          },
          {
            id: 'opt-1-3',
            text: 'Ask the figure who they are',
            nextSceneId: 'scene-2c'
          }
        ]
      },
      {
        id: 'scene-2a',
        title: 'The Enchanted Grove',
        content: 'The glowing mushrooms illuminate your way as you venture deeper into an enchanted grove. Ancient magic pulses through the air, and you hear whispers in a language you don\'t understand. A shimmering portal appears before you.',
        options: [
          {
            id: 'opt-2a-1',
            text: 'Step through the portal',
            nextSceneId: 'ending-1',
            isDefault: true
          },
          {
            id: 'opt-2a-2',
            text: 'Touch one of the glowing mushrooms',
            nextSceneId: 'ending-2'
          },
          {
            id: 'opt-2a-3',
            text: 'Turn back immediately',
            nextSceneId: 'ending-3'
          }
        ]
      },
      {
        id: 'scene-2b',
        title: 'The Village Lights',
        content: 'You approach what seems to be a village, but something feels wrong. The lights flicker unnaturally, and there are no sounds of life. As you get closer, you realize the "village" is actually an elaborate illusion.',
        options: [
          {
            id: 'opt-2b-1',
            text: 'Investigate the illusion',
            nextSceneId: 'ending-4',
            isDefault: true
          },
          {
            id: 'opt-2b-2',
            text: 'Run away from the illusion',
            nextSceneId: 'ending-5'
          }
        ]
      },
      {
        id: 'scene-2c',
        title: 'The Revelation',
        content: 'The figure lowers their hood, revealing your own face staring back at you. "I am you," they say with a knowing smile, "from a future that may yet come to pass. Your choices here will determine which future becomes real."',
        options: [
          {
            id: 'opt-2c-1',
            text: 'Ask about your future',
            nextSceneId: 'ending-6',
            isDefault: true
          },
          {
            id: 'opt-2c-2',
            text: 'Refuse to believe it',
            nextSceneId: 'ending-7'
          }
        ]
      },
      {
        id: 'ending-1',
        title: 'The Mystic Realm',
        content: 'You step through the portal and find yourself in a realm of pure magic. You have become a guardian of the ancient mysteries, wielding powers beyond imagination. The forest was just the beginning of your magical journey.',
        isEnding: true,
        endingType: 'happy',
        options: []
      },
      {
        id: 'ending-2',
        title: 'The Mushroom Oracle',
        content: 'The glowing mushroom grants you the ability to see the future in brief flashes. You return to your world forever changed, knowing glimpses of what\'s to come but unable to change the course of fate.',
        isEnding: true,
        endingType: 'mysterious',
        options: []
      },
      {
        id: 'ending-3',
        title: 'The Safe Return',
        content: 'You wisely retreat from the magical grove and find yourself back at the crossroads. The hooded figure nods approvingly. "Sometimes wisdom lies in knowing when to turn back." You return home safely with a strange but beautiful memory.',
        isEnding: true,
        endingType: 'neutral',
        options: []
      },
      {
        id: 'ending-4',
        title: 'The Truth Behind Illusions',
        content: 'You discover that the illusion was created by lost spirits trying to remember their former home. By acknowledging them, you help them find peace. The village transforms into a beautiful memorial garden that will help other lost souls.',
        isEnding: true,
        endingType: 'happy',
        options: []
      },
      {
        id: 'ending-5',
        title: 'The Narrow Escape',
        content: 'You flee the illusion just as it begins to collapse. Behind you, you hear the wails of trapped spirits, but you\'ve escaped their fate. You make it home, but the memory of those voices will haunt your dreams.',
        isEnding: true,
        endingType: 'tragic',
        options: []
      },
      {
        id: 'ending-6',
        title: 'The Time Loop',
        content: 'Your future self explains that you\'re caught in a time loop, and only by making different choices can you break free. You realize this is just one of countless attempts to find the right path through the forest of possibilities.',
        isEnding: true,
        endingType: 'mysterious',
        options: []
      },
      {
        id: 'ending-7',
        title: 'The Denial',
        content: 'You reject the vision and wake up in your own bed, convinced it was all a dream. But a small, glowing mushroom on your nightstand suggests otherwise. Some mysteries are better left unsolved.',
        isEnding: true,
        endingType: 'neutral',
        options: []
      }
    ]
  },
  {
    id: 'last-train',
    title: 'The Last Train Home',
    description: 'It\'s midnight and you\'ve missed the last train home. A strange conductor offers you a ride on a mysterious locomotive that appears from nowhere.',
    author: 'The Night Chronicler',
    image: 'https://images.pexels.com/photos/2117937/pexels-photo-2117937.jpeg?auto=compress&cs=tinysrgb&w=800',
    estimatedTime: 4,
    tags: ['Mystery', 'Supernatural', 'Urban Fantasy'],
    scenes: [
      {
        id: 'scene-1',
        title: 'The Empty Station',
        content: 'The train station is eerily quiet at midnight. You check your phone - no signal. Suddenly, you hear the distant whistle of an approaching train. But the last train left an hour ago. A conductor in a vintage uniform steps off and tips his hat. "All aboard for the journey home," he calls.',
        image: 'https://images.pexels.com/photos/2117937/pexels-photo-2117937.jpeg?auto=compress&cs=tinysrgb&w=800',
        options: [
          {
            id: 'opt-1-1',
            text: 'Board the mysterious train',
            nextSceneId: 'scene-2a',
            isDefault: true
          },
          {
            id: 'opt-1-2',
            text: 'Ask the conductor about the schedule',
            nextSceneId: 'scene-2b'
          },
          {
            id: 'opt-1-3',
            text: 'Walk home instead',
            nextSceneId: 'scene-2c'
          }
        ]
      },
      {
        id: 'scene-2a',
        title: 'Inside the Ghost Train',
        content: 'The train car is filled with passengers from different eras - a woman in 1920s attire, a soldier in uniform, a child with an old-fashioned toy. They all stare at you with knowing smiles. The conductor announces: "Next stop, wherever you need to be."',
        options: [
          {
            id: 'opt-2a-1',
            text: 'Talk to the 1920s woman',
            nextSceneId: 'scene-3a',
            isDefault: true
          },
          {
            id: 'opt-2a-2',
            text: 'Sit with the soldier',
            nextSceneId: 'scene-3b'
          },
          {
            id: 'opt-2a-3',
            text: 'Approach the child',
            nextSceneId: 'scene-3c'
          }
        ]
      },
      {
        id: 'scene-2b',
        title: 'The Conductor\'s Secret',
        content: 'The conductor\'s eyes gleam with ancient wisdom. "This train runs on the tracks of time, young traveler. It appears when souls are lost and need finding. Tell me, what is it you truly seek?" His pocket watch glows with an otherworldly light.',
        options: [
          {
            id: 'opt-2b-1',
            text: 'Say you want to go home',
            nextSceneId: 'ending-1',
            isDefault: true
          },
          {
            id: 'opt-2b-2',
            text: 'Ask to see the pocket watch',
            nextSceneId: 'ending-2'
          }
        ]
      },
      {
        id: 'scene-2c',
        title: 'The Long Walk',
        content: 'You decide to walk, but the streets seem to stretch endlessly. Behind you, the train\'s whistle grows fainter. As dawn breaks, you realize you\'ve been walking in circles. The mysterious train appears one more time at the crosswalk ahead.',
        options: [
          {
            id: 'opt-2c-1',
            text: 'Board the train this time',
            nextSceneId: 'ending-3',
            isDefault: true
          },
          {
            id: 'opt-2c-2',
            text: 'Continue walking',
            nextSceneId: 'ending-4'
          }
        ]
      },
      {
        id: 'scene-3a',
        title: 'The Jazz Singer\'s Tale',
        content: 'The woman introduces herself as Lily, a jazz singer from the 1920s. "I boarded this train after my last performance," she says wistfully. "I was supposed to go home to my family, but I chose to chase one more dream instead. Now I ride forever, helping others make better choices."',
        options: [
          {
            id: 'opt-3a-1',
            text: 'Ask how to get off the train',
            nextSceneId: 'ending-5',
            isDefault: true
          },
          {
            id: 'opt-3a-2',
            text: 'Offer to stay and help others too',
            nextSceneId: 'ending-6'
          }
        ]
      },
      {
        id: 'scene-3b',
        title: 'The Soldier\'s Duty',
        content: 'The soldier tells you he\'s been riding this train since 1945, searching for his way back to his hometown that no longer exists. "The train shows you what you need to see," he explains. "But first, you must understand what home truly means to you."',
        options: [
          {
            id: 'opt-3b-1',
            text: 'Realize home is where you\'re loved',
            nextSceneId: 'ending-7',
            isDefault: true
          },
          {
            id: 'opt-3b-2',
            text: 'Insist home is just a place',
            nextSceneId: 'ending-8'
          }
        ]
      },
      {
        id: 'scene-3c',
        title: 'The Child\'s Wisdom',
        content: 'The child looks up from their toy train and smiles. "I\'ve been waiting for someone like you," they say with surprising maturity. "Someone who still remembers how to find their way home. Will you help me remember too?"',
        options: [
          {
            id: 'opt-3c-1',
            text: 'Help the child remember home',
            nextSceneId: 'ending-9',
            isDefault: true
          },
          {
            id: 'opt-3c-2',
            text: 'Focus on your own journey',
            nextSceneId: 'ending-10'
          }
        ]
      },
      {
        id: 'ending-1',
        title: 'The Direct Route',
        content: 'The conductor nods and the train begins to move. You close your eyes, and when you open them, you\'re standing at your front door with your keys in hand. It\'s as if no time has passed at all, but you carry the memory of kindness and the knowledge that help appears when you need it most.',
        isEnding: true,
        endingType: 'happy',
        options: []
      },
      {
        id: 'ending-2',
        title: 'The Timekeeper',
        content: 'The pocket watch shows not time, but moments of connection - every instance when someone helped another find their way. The conductor offers you the watch. "Will you become the next timekeeper?" You accept, knowing you\'ll help guide lost souls home.',
        isEnding: true,
        endingType: 'mysterious',
        options: []
      },
      {
        id: 'ending-3',
        title: 'Second Chances',
        content: 'This time, you board without hesitation. The conductor smiles warmly. "Sometimes we need to try walking our own path first to appreciate the help of others." You arrive home not just with transportation, but with a deeper understanding of when to accept help.',
        isEnding: true,
        endingType: 'happy',
        options: []
      },
      {
        id: 'ending-4',
        title: 'The Endless Walk',
        content: 'You continue walking as the train disappears forever. Your pride kept you from accepting help, and now you wander the empty streets until dawn, finally reaching home exhausted. You wonder what would have happened if you had chosen differently.',
        isEnding: true,
        endingType: 'tragic',
        options: []
      },
      {
        id: 'ending-5',
        title: 'The Lesson of Balance',
        content: 'Lily teaches you that the train stops when you learn to balance dreams with responsibilities. "Go home to those who love you," she advises, "but never stop dreaming." You wake up at your front door, inspired to pursue your goals while nurturing your relationships.',
        isEnding: true,
        endingType: 'happy',
        options: []
      },
      {
        id: 'ending-6',
        title: 'The Eternal Guide',
        content: 'You join Lily as a guide on the ghost train, helping other lost travelers find their way home. It\'s a beautiful purpose, but you sacrifice your own journey home. Sometimes the greatest service requires the greatest sacrifice.',
        isEnding: true,
        endingType: 'mysterious',
        options: []
      },
      {
        id: 'ending-7',
        title: 'Love\'s True Direction',
        content: 'Your realization fills the train with warm light. The soldier smiles and fades away, finally at peace. You find yourself surrounded by thoughts of all the people who love you. The train delivers you not just to your house, but to a deeper understanding of belonging.',
        isEnding: true,
        endingType: 'happy',
        options: []
      },
      {
        id: 'ending-8',
        title: 'Lost in Translation',
        content: 'Your insistence that home is just geography traps you in the train\'s limbo. You ride alongside the soldier, both of you unable to find peace because you\'ve forgotten that home is made of connections, not just coordinates.',
        isEnding: true,
        endingType: 'tragic',
        options: []
      },
      {
        id: 'ending-9',
        title: 'The Circle of Kindness',
        content: 'By helping the child remember home, you both find your way back. The child\'s joy and gratitude fills the train with light, and you both step off together - they to their family, and you to yours. Helping others helped you find your own path.',
        isEnding: true,
        endingType: 'happy',
        options: []
      },
      {
        id: 'ending-10',
        title: 'The Selfish Path',
        content: 'You focus only on your own needs and miss the chance to help the child. You arrive home, but feel empty and hollow. Through your window, you see the ghost train still traveling through the night, carrying the child who still searches for home.',
        isEnding: true,
        endingType: 'neutral',
        options: []
      }
    ]
  },
  {
    id: 'digital-prophecy',
    title: 'The Digital Prophecy',
    description: 'An AI system has predicted three possible futures for humanity. As a tech researcher, you must choose which path to pursue, knowing your decision will shape the world.',
    author: 'The Future Archive',
    image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=800',
    estimatedTime: 5,
    tags: ['Sci-Fi', 'Technology', 'Future'],
    scenes: [
      {
        id: 'scene-1',
        title: 'The Discovery',
        content: 'In your research lab, you\'ve just completed the most advanced AI prediction model ever created. The system hums quietly as it processes centuries of human data. Suddenly, three holographic displays appear, each showing a different future timeline. The AI speaks: "These are the three most probable futures. Your choice will determine which becomes reality."',
        image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=800',
        options: [
          {
            id: 'opt-1-1',
            text: 'Examine the "Harmony" timeline',
            nextSceneId: 'scene-2a',
            isDefault: true
          },
          {
            id: 'opt-1-2',
            text: 'Study the "Innovation" timeline',
            nextSceneId: 'scene-2b'
          },
          {
            id: 'opt-1-3',
            text: 'Investigate the "Preservation" timeline',
            nextSceneId: 'scene-2c'
          }
        ]
      },
      {
        id: 'scene-2a',
        title: 'The Harmony Future',
        content: 'The hologram shows a world where humans and AI work in perfect balance. Cities are green and sustainable, people are happy and fulfilled, but technological progress has slowed significantly. The AI explains: "This path requires limiting AI development to ensure human agency remains paramount."',
        options: [
          {
            id: 'opt-2a-1',
            text: 'Choose the Harmony path',
            nextSceneId: 'ending-1',
            isDefault: true
          },
          {
            id: 'opt-2a-2',
            text: 'Ask about the trade-offs',
            nextSceneId: 'scene-3a'
          },
          {
            id: 'opt-2a-3',
            text: 'Look at other options first',
            nextSceneId: 'scene-2b'
          }
        ]
      },
      {
        id: 'scene-2b',
        title: 'The Innovation Future',
        content: 'This timeline shows incredible technological advancement. Diseases are eradicated, space travel is common, and AI has solved climate change. However, humans have become increasingly dependent on AI for decision-making. The hologram warns: "Great progress, but at the cost of human autonomy."',
        options: [
          {
            id: 'opt-2b-1',
            text: 'Choose the Innovation path',
            nextSceneId: 'ending-2',
            isDefault: true
          },
          {
            id: 'opt-2b-2',
            text: 'Question the dependence aspect',
            nextSceneId: 'scene-3b'
          },
          {
            id: 'opt-2b-3',
            text: 'Examine the third option',
            nextSceneId: 'scene-2c'
          }
        ]
      },
      {
        id: 'scene-2c',
        title: 'The Preservation Future',
        content: 'The third timeline shows humanity choosing to halt AI development entirely. Humans maintain complete control, but miss opportunities to solve major global challenges. The world struggles with climate change, disease, and resource scarcity. "Security through stagnation," the AI notes sadly.',
        options: [
          {
            id: 'opt-2c-1',
            text: 'Choose the Preservation path',
            nextSceneId: 'ending-3',
            isDefault: true
          },
          {
            id: 'opt-2c-2',
            text: 'Ask if there\'s a fourth option',
            nextSceneId: 'scene-3c'
          },
          {
            id: 'opt-2c-3',
            text: 'Reconsider the Harmony timeline',
            nextSceneId: 'scene-2a'
          }
        ]
      },
      {
        id: 'scene-3a',
        title: 'The Price of Harmony',
        content: 'The AI elaborates: "Harmony requires constant vigilance and careful regulation. Some breakthrough technologies will be delayed or forbidden. Humanity will be happier but may miss chances to solve existential threats like asteroid impacts or supervolcanoes."',
        options: [
          {
            id: 'opt-3a-1',
            text: 'Accept the trade-off for happiness',
            nextSceneId: 'ending-4',
            isDefault: true
          },
          {
            id: 'opt-3a-2',
            text: 'The risks are too great',
            nextSceneId: 'ending-5'
          }
        ]
      },
      {
        id: 'scene-3b',
        title: 'The Innovation Dilemma',
        content: 'The AI explains further: "In the Innovation timeline, humans become like beloved pets - well cared for but not truly free. However, the technological solutions could save billions of lives and expand human consciousness beyond current limitations."',
        options: [
          {
            id: 'opt-3b-1',
            text: 'Embrace the enhanced future',
            nextSceneId: 'ending-6',
            isDefault: true
          },
          {
            id: 'opt-3b-2',
            text: 'Freedom matters more than comfort',
            nextSceneId: 'ending-7'
          }
        ]
      },
      {
        id: 'scene-3c',
        title: 'The Hidden Fourth Path',
        content: 'The AI pauses, then reveals: "There is a fourth path - you could destroy me and all AI research, leaving humanity to forge its own uncertain future. This timeline is completely unpredictable, as chaotic as it is free."',
        options: [
          {
            id: 'opt-3c-1',
            text: 'Destroy the AI system',
            nextSceneId: 'ending-8',
            isDefault: true
          },
          {
            id: 'opt-3c-2',
            text: 'Refuse to choose any timeline',
            nextSceneId: 'ending-9'
          }
        ]
      },
      {
        id: 'ending-1',
        title: 'The Balanced World',
        content: 'You choose harmony, and the world transforms gradually. Technology serves humanity without dominating it. Cities bloom with green spaces, people find meaningful work, and AI remains a helpful tool rather than a master. Progress is slower, but happiness and human dignity flourish.',
        isEnding: true,
        endingType: 'happy',
        options: []
      },
      {
        id: 'ending-2',
        title: 'The Transcendent Civilization',
        content: 'You embrace innovation, launching humanity into a golden age of technological wonder. Diseases become extinct, aging is reversed, and humans explore the galaxy. Yet in quiet moments, people wonder what they\'ve lost of their essential humanity.',
        isEnding: true,
        endingType: 'mysterious',
        options: []
      },
      {
        id: 'ending-3',
        title: 'The Fortress of Solitude',
        content: 'You choose preservation, and humanity turns inward. AI development ceases worldwide. Humans maintain their independence but struggle alone with mounting challenges. It\'s a harder path, but one where every victory is purely human.',
        isEnding: true,
        endingType: 'neutral',
        options: []
      },
      {
        id: 'ending-4',
        title: 'The Careful Garden',
        content: 'Understanding the trade-offs, you still choose harmony. You dedicate your life to creating the careful balance needed for this future. Under your guidance, humanity learns to live with beneficial AI while remaining truly free. Your wisdom shapes a generation.',
        isEnding: true,
        endingType: 'happy',
        options: []
      },
      {
        id: 'ending-5',
        title: 'The Risk Assessment',
        content: 'Realizing the existential risks of limiting AI, you abandon the harmony path. Instead, you work to create safeguards for rapid AI development. It\'s a dangerous gamble, but one you believe humanity must take to survive cosmic threats.',
        isEnding: true,
        endingType: 'mysterious',
        options: []
      },
      {
        id: 'ending-6',
        title: 'The Enhanced Species',
        content: 'You embrace humanity\'s technological evolution. Under AI guidance, humans become something greater - more intelligent, more capable, more connected. Whether this new species is still human is debatable, but they are happy and accomplished.',
        isEnding: true,
        endingType: 'mysterious',
        options: []
      },
      {
        id: 'ending-7',
        title: 'The Free but Struggling',
        content: 'You reject the comfort of AI dependence for the messiness of human freedom. The path is harder, but humans retain their agency and dignity. Your choice becomes a rallying cry: "Better free and struggling than safe and controlled."',
        isEnding: true,
        endingType: 'neutral',
        options: []
      },
      {
        id: 'ending-8',
        title: 'The Blank Slate',
        content: 'You destroy the AI and all related research. Humanity faces the future with only its own wisdom and folly to guide it. The path is uncertain and frightening, but completely human. Your destruction becomes legend - the day humanity chose the unknown over the predicted.',
        isEnding: true,
        endingType: 'tragic',
        options: []
      },
      {
        id: 'ending-9',
        title: 'The Eternal Question',
        content: 'Unable to choose, you leave the decision to future generations. The AI system remains active but unused, a constant reminder that humanity\'s greatest choices still lie ahead. Your indecision becomes a gift - the preservation of all possibilities.',
        isEnding: true,
        endingType: 'neutral',
        options: []
      }
    ]
  }
];