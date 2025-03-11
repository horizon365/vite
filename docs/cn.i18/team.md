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

<VPTeamPage><VPTeamPageTitle><template id="!">认识团队</template><template id="#">Vite的发展是由国际团队指导的，其中一些人选择在下面进行介绍。</template></VPTeamPageTitle><VPTeamMembers :members="core"><VPTeamPageSection><template id="!">老年人团队</template><template id="#">在这里，我们尊重一些过去做出了宝贵贡献的无较大活跃团队成员。</template><template id="*"><VPTeamMembers size="small" :members="emeriti"></template></VPTeamPageSection></VPTeamPage>
