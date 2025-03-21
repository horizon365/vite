---
layout: page
title: 认识团队
description: Vite的发展由国际团队指导。
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamPageSection,
  VPTeamMembers
} from 'vitepress/theme'
import { core, emeriti } from '../_data/team'
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Meet the Team</template>
    <template #lead>
      The development of Vite is guided by an international team, some of whom
      have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="core" />
  <VPTeamPageSection>
    <template #title>Team Emeriti</template>
    <template #lead>
      Here we honor some no-longer-active team members who have made valuable
      contributions in the past.
    </template>
    <template #members>
      <VPTeamMembers size="small" :members="emeriti" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
