module.exports = {
  output: {
    path: 'self',
    dirname: '',
    filename: '[name]',
  },
  md: {
    methods: {
      title: 'Methods',
      titleTag: '##',
      headers: [
        { name: 'name', sourceKey: 'key' },
        { name: 'params', sourceKey: 'params' },
        { name: 'description', sourceKey: 'description' },
      ],
    },
    props: {
      title: 'Props',
      titleTag: '##',
      headers: [
        { name: 'name', sourceKey: 'key' },
        { name: 'type', sourceKey: 'type' },
        { name: 'default', sourceKey: 'default' },
        { name: 'description', sourceKey: 'description' },
      ],
    },
    events: {
      title: 'Event',
      titleTag: '##',
      headers: [
        { name: 'name', sourceKey: 'key' },
        { name: 'params', sourceKey: 'params' },
        { name: 'description', sourceKey: 'description' },
      ],
    },

  },
};
