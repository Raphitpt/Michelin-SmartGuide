import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/routes',
        'architecture/database',
        'architecture/auth',
      ],
    },
    {
      type: 'category',
      label: 'Parcours sensoriel',
      items: [
        'sensoriel/overview',
        'sensoriel/scoring',
        'sensoriel/components',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/restaurants',
        'api/server-actions',
      ],
    },
    {
      type: 'category',
      label: 'Composants',
      items: [
        'components/ui',
        'components/pages',
        'components/restaurant',
        'components/admin',
      ],
    },
    {
      type: 'category',
      label: 'Déploiement',
      items: [
        'deployment/docker',
        'deployment/env',
      ],
    },
  ],
};

export default sidebars;