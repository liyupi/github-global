// 检查 GitHub Token 权限的脚本

import { Octokit } from 'octokit';

async function checkTokenPermissions(token: string) {
  const octokit = new Octokit({ auth: token });

  try {
    // 1. 检查认证用户
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log('✅ Authenticated as:', user.login);
    console.log('   User type:', user.type);

    // 2. 检查 token 的 scopes
    const { headers } = await octokit.request('GET /user');
    const scopes = headers['x-oauth-scopes'];
    console.log('✅ OAuth Scopes:', scopes || 'None (might be GitHub App token)');

    // 3. 尝试访问一个测试仓库
    console.log('\n测试仓库访问权限:');
    const testOwner = user.login;
    
    // 列出用户的仓库
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 5,
      sort: 'updated',
    });
    
    if (repos.length > 0) {
      const testRepo = repos[0];
      console.log(`✅ Can read repos. Testing with: ${testRepo.full_name}`);

      // 尝试创建一个测试分支
      try {
        const { data: refData } = await octokit.rest.git.getRef({
          owner: testRepo.owner.login,
          repo: testRepo.name,
          ref: `heads/${testRepo.default_branch}`,
        });

        console.log('✅ Can read refs');

        // 尝试创建分支（会失败但能看到错误）
        const testBranchName = `test-permission-${Date.now()}`;
        try {
          await octokit.rest.git.createRef({
            owner: testRepo.owner.login,
            repo: testRepo.name,
            ref: `refs/heads/${testBranchName}`,
            sha: refData.object.sha,
          });
          console.log('✅ Can create branches - WRITE permission confirmed!');
          
          // 清理测试分支
          await octokit.rest.git.deleteRef({
            owner: testRepo.owner.login,
            repo: testRepo.name,
            ref: `heads/${testBranchName}`,
          });
          console.log('✅ Test branch cleaned up');
        } catch (error: any) {
          console.error('❌ Cannot create branches:', error.message);
          console.error('   Status:', error.status);
          console.error('   This is the problem!');
        }
      } catch (error: any) {
        console.error('❌ Cannot read refs:', error.message);
      }
    }

    // 4. 检查是否是 GitHub App token
    try {
      const { data: installations } = await octokit.rest.apps.listInstallationsForAuthenticatedUser();
      console.log('\n✅ This is a GitHub App user token');
      console.log('   Installations:', installations.total_count);
      
      if (installations.total_count === 0) {
        console.log('⚠️  WARNING: No GitHub App installations found!');
        console.log('   You need to install the GitHub App to access repositories.');
      }
    } catch (error) {
      console.log('\nℹ️  This is a regular OAuth token (not GitHub App)');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('   Status:', error.status);
  }
}

// 从命令行参数获取 token
const token = process.argv[2];

if (!token) {
  console.error('Usage: ts-node check-github-token.ts <your-github-token>');
  process.exit(1);
}

checkTokenPermissions(token);
