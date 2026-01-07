export const MOCK_CHATS = [
  { id: '1', title: 'React Project Help', date: new Date().toISOString() },
  { id: '2', title: 'Fixing Build Errors', date: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
  { id: '3', title: 'Explaining Quantum Physics', date: new Date(Date.now() - 172800000).toISOString() }, // 2 days ago
];

export const MOCK_MESSAGES = {
  '1': [
    { id: 'm1', sender: 'user', content: 'How do I initialize a React project?', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm2', sender: 'ai', content: 'You can use Vite! Run `npm create vite@latest` in your terminal.', timestamp: new Date(Date.now() - 3590000).toISOString() },
  ],
  '2': [
    { id: 'm1', sender: 'user', content: 'I have an error in my build.', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'm2', sender: 'ai', content: 'Can you paste the error message here?', timestamp: new Date(Date.now() - 86390000).toISOString() },
  ],
  '3': [
      { id: 'm1', sender: 'user', content: 'Explain quantum entanglement simply.', timestamp: new Date(Date.now() - 172800000).toISOString() }
  ]
};
