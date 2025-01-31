import lodash from 'lodash';
const { random } = lodash;
import { postEphemeral } from "./slack.js"

export default async ({ event }) => {
  const { item, user, reaction, item_user } = event;
  const { channel, ts } = item;
  const get = (arr) => random(0, arr.length - 1);
  const randomize = () => [
    get(platforms),
    get(verbs),
    get(subjects),
    get(stacks),
    get(slander),
  ];
  const indices = randomize();
  const makeText = () =>
    `${slander[indices[4]]} ${platforms[indices[0]]} that ${
      verbs[indices[1]]
    } ${subjects[indices[2]]} using ${stacks[indices[3]]}`;
  const text = makeText();
  await postEphemeral(channel, text, user);
  return text;
};

const slander = [
  `you want an idea!!! well i'll give you an idea:`,
  `yeah, that's right, i'm more creative than you...`,
  "idea!!! yummy idea!!!",
  "ugh, another idea (how am i gonna make my millions??):",
  "welll..... you could build a",
  "you could (hmm... maybe you could) build a",
  "get off your bumm and make a",
  "chop chop time to make a",
  `don't be lazy young one!! time to build a`,
  "i have an idea:",
  "i have one more idea than you:",
];

const platforms = [
  "Slack bot",
  "SMS bot",
  "iPhone app",
  "Arduino board",
  "Website",
  "Robot",
  "Fake robot",
  "ML model",
  "Ancient software",
  "Smartwatch",
  "Smart camera",
  "Microcomputer",
  "Windows program",
  "Mac app",
];

const verbs = [
  "remixes",
  "generates",
  "psychoanalyzes",
  "transcribes",
  "scans",
  "hand-draws",
  "deep-fries",
  "stuns",
  "eats",
  "builds",
  "examines",
  "inspects",
  "researches",
  "solves",
  "explains",
  "investigates",
  "cleans",
  "measures",
  "cooks",
];

const subjects = [
  "Hack Club community members",
  "iPhone apps",
  "lamps",
  "floorplans",
  "iPad Pro keyboards",
  "chicken fingers",
  "McDonalds packaging",
  "chicken nuggets",
  "board games",
  "fruit",
  "fish",
  "pencils",
  "books",
  "headphones",
  "soccer balls",
  "insect repellent",
  "hazmat suits",
  "paint brushes",
  "video calls",
  "calendars",
  "cups",
  "speakers",
  "rulers",
  "erasers",
  "tv remotes",
  "bikes",
  "newspapers",
  "pens",
  "light bulbs",
  "LED lights",
  "apples",
  "oranges",
  "atlases",
  "power plugs",
  "computers",
  "ancient scrolls",
  "statues",
  "hammers",
  "superheros",
  "teddy bears",
  "alpacas",
  "cables",
  "stuffed toys",
];

const stacks = [
  "AI",
  "ML",
  "blockchain",
  "React.js",
  "a CLI",
  "Redwood.js",
  "Markdown",
  "Rust",
  "Go",
  "JavaScript",
  "Twilio",
  "the GitHub API",
  "Ruby on Rails",
  "serverless",
  "Python",
  "Next.js",
  "COBOL",
  "Flask",
  "Django",
  "Tensorflow",
  "C++",
  "Swift",
  "Java",
  "Binary",
];
