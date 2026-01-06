export default async function decorate(block) {
  const [row] = block.children;
  const [, col] = row.children;
  const [pathNode] = col.children;
  const path = pathNode.textContent.trim();

  const endpoint = 'http://localhost:4503/content/_cq_graphql/digitechpartnersandboxprogram/endpoint.json';
  const query = `
    query ($Path: String!) {
      schoolOpenDayByPath(_path: $Path) {
        item {
          title
          introduction {
            html
          }
          registrationInfo {
            html
          }
          formLink
          campusTour {
            html
          }
          importantInfo {
            html
          }
          contactInfo {
            html
          }
          image {
            ... on ImageRef {
              _path
              _authorUrl
              _publishUrl
              title
              description
            }
          }
        }
      }
    }
  `;

  const csrfToken = 'eyJleHAiOjE3NTg1MTg1MjEsImlhdCI6MTc1ODUxNzkyMX0.4sV_OfA5t7XTGzDNPCk2Vmiuwm4y5h9kthbUaxxOik0';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        query,
        variables: {
          Path: path,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }

    const { data } = await response.json();
    const item = data?.schoolOpenDayByPath?.item;

    if (!item) {
      return;
    }

    const container = document.createElement('div');

    // Title
    if (item.title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'cards-card-body-title';
      titleDiv.innerHTML = `<h2>${item.title}</h2>`;
      container.append(titleDiv);
    }

    // Image
    if (item.image?._publishUrl) {
      const imgDiv = document.createElement('div');
      imgDiv.className = 'cards-card-image';

      const img = document.createElement('img');
      img.src = item.image._publishUrl;
      img.alt = item.image.title || '';

      imgDiv.append(img);
      container.append(imgDiv);
    }

    // Introduction
    if (item.introduction?.html) {
      const introDiv = document.createElement('div');
      introDiv.className = 'cards-card-body';
      introDiv.innerHTML = item.introduction.html;
      container.append(introDiv);
    }

    // Registration Info
    if (item.registrationInfo?.html) {
      const registrationDiv = document.createElement('div');
      registrationDiv.className = 'cards-card-body-registrationInfo';
      registrationDiv.innerHTML = item.registrationInfo.html;
      container.append(registrationDiv);
    }

    // Registration Button
    if (item.formLink) {
      const formLink = document.createElement('a');
      formLink.className = 'cards-card-body-formLink';
      formLink.href = item.formLink;
      formLink.textContent = 'Register Here';
      container.append(formLink);
    }

    // Campus Tour
    if (item.campusTour?.html) {
      const campusTourDiv = document.createElement('div');
      campusTourDiv.className = 'cards-card-body-campusTour';
      campusTourDiv.innerHTML = item.campusTour.html;
      container.append(campusTourDiv);
    }

    // Important Info
    if (item.importantInfo?.html) {
      const importantInfoDiv = document.createElement('div');
      importantInfoDiv.className = 'cards-card-body-importantInfo';
      importantInfoDiv.innerHTML = item.importantInfo.html;
      container.append(importantInfoDiv);
    }

    // Contact Info
    if (item.contactInfo?.html) {
      const contactInfoDiv = document.createElement('div');
      contactInfoDiv.className = 'cards-card-body-contactInfo';
      contactInfoDiv.innerHTML = item.contactInfo.html;
      container.append(contactInfoDiv);
    }

    block.textContent = '';
    block.append(container);
  } catch (e) {
    block.innerHTML = '<p>Error loading content.</p>';
  }
}
