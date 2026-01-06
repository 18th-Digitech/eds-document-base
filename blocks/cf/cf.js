import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  const table = block.querySelector('table');
  
  const row = block.children[0];
  const col = row.children[1];
  const path = col.children[0].textContent;
  const endpoint = 'http://localhost:4503/content/_cq_graphql/digitechpartnersandboxprogram/endpoint.json';
  const query = `
    query($Path: String!) {
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

  // The CSRF token you provided. ⚠️ Note: This is a static token and will expire.
  // In a real application, you should fetch this token dynamically.
  const csrfToken = 'eyJleHAiOjE3NTg1MTg1MjEsImlhdCI6MTc1ODUxNzkyMX0.4sV_OfA5t7XTGzDNPCk2Vmiuwm4y5h9kthbUaxxOik0';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken // Add the hardcoded CSRF token here
      },
      body: JSON.stringify({
        query,
        variables: { Path: path }
      }),
    });
    
    // Check if the response was successful before proceeding
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GraphQL request failed with status ${response.status}: ${errorText}`);
    }

    const { data } = await response.json();
    console.log(data);
    const item = data.schoolOpenDayByPath.item;

    if (item) {
      // Build the page using the fetched data
      const div = document.createElement('div');

      // Title
      const titleDiv = document.createElement('div');
      titleDiv.className = 'cards-card-body-title';
      titleDiv.innerHTML = `<h2>${item.title}</h2>`;
      div.append(titleDiv);

      // Image
        if (item.image?._publishUrl) {
          const imgDiv = document.createElement('div');
          imgDiv.className = 'cards-card-image';
          const picture = item.image._publishUrl;
          const imageTag =document.createElement('img');
          imageTag.setAttribute("src", item.image._publishUrl);
          imgDiv.append(imageTag);
          div.append(imgDiv);
        }

      // Introduction
      if (item.introduction?.html) {
        const introDiv = document.createElement('div');
        introDiv.className = 'cards-card-body';
        introDiv.innerHTML = item.introduction.html;
        div.append(introDiv);
      }


      // registrationInfo
      if (item.registrationInfo?.html) {
        const registrationInfo = document.createElement('div');
        registrationInfo.className = 'cards-card-body-registrationInfo';
        registrationInfo.innerHTML = item.registrationInfo.html;
        div.append(registrationInfo);
      }

      // registrationButton
      if (item.formLink) {
        const formLink = document.createElement('a');
        formLink.className = 'cards-card-body-formLink';
        formLink.setAttribute("href", item.formLink);
        formLink.textContent = "Register Here"; 
        div.append(formLink);
      }


      // campusTour
      if (item.campusTour?.html) {
        const campusTour = document.createElement('div');
        campusTour.className = 'cards-card-body-campusTour';
        campusTour.innerHTML = item.campusTour.html;
        div.append(campusTour);
      }


      // importantInfo
      if (item.importantInfo?.html) {
        const importantInfo = document.createElement('div');
        importantInfo.className = 'cards-card-body-importantInfo';
        importantInfo.innerHTML = item.importantInfo.html;
        div.append(importantInfo);
      }


      // contactInfo
      if (item.contactInfo?.html) {
        const contactInfo = document.createElement('div');
        contactInfo.className = 'cards-card-body-contactInfo';
        contactInfo.innerHTML = item.contactInfo.html;
        div.append(contactInfo);
      }
      
      block.textContent = '';
      block.append(div);
    }
  } catch (error) {
    console.error('Error fetching GraphQL data:', error);
    block.innerHTML = `<p>Error loading content: ${error.message}</p>`;
  }
}