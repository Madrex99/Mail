document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_emails);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-details').style.display = 'none';



  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


}
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';

  // get emails via api
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)
    // print each email
    emails.forEach(email => {
      const element = document.createElement('div');
      element.style.cssText = 'border: 2px black solid; padding: 5px; margin-bottom: 5px';
      element.innerHTML = `
        <h6>From: ${email.sender} </h6>
        <h5>Subject: ${email.subject} </h5>
        <p style=" color: gray;"> ${email.timestamp} </p>
      `;

      if (email.read) {
        element.style.backgroundColor = '#dcdcdc';
      } else {
        element.style.backgroundColor = 'white';
      }

      document.querySelector('#emails-view').append(element);

      const id = email.id;

      element.addEventListener('click', function() {
        email_click(id, 'email-details', mailbox === 'sent')
      });

    });
    
  })

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function send_emails(event) {
  event.preventDefault()

  recipient = document.querySelector('#compose-recipients').value
  subject = document.querySelector('#compose-subject').value
  body = document.querySelector('#compose-body').value

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipient,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    // print th result
    console.log(result);
    load_mailbox('sent');
  })


}

function email_click(id, email, isInbox) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'block';
  
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(data => {
    const element = document.querySelector(`#${email}`);
    element.innerHTML = `
      <p><span style="font-weight: bold;">From: </span>${data.sender}</p>
      <p><span style="font-weight: bold;">To: </span>${data.recipients}</p>
      <p><span style="font-weight: bold;">Subject: </span>${data.subject}</p>
      <p><span style="font-weight: bold;">Timestamp: </span>${data.timestamp}</p>
      <hr>
      <p>${data.body}</p>
      <hr>
    `;

    // Setting up Archive button only in inbox and archived
    if (!isInbox) {
      const archiveButton = document.createElement('button');
      archiveButton.innerHTML = data.archived ? "Unarchive" : "Archive"
      archiveButton.className = data.archived ? "btn btn-danger" : "btn btn-success"
      archiveButton.addEventListener('click', function() {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !data.archived
          })
        })
        .then(() => { load_mailbox('inbox'); })
      })
      document.querySelector(`#${email}`).append(archiveButton);
    }

    // Set up the reply button only in inbox and archived
    if (!isInbox) {
      const replyButton = document.createElement('button');
      replyButton.innerHTML = "Reply"
      replyButton.className = "btn btn-primary"
      replyButton.style = "margin-left: 10px;"
      replyButton.addEventListener('click', function() {
        compose_email();
        const recipient = data.sender;
        let subject = data.subject;
        if (subject.split(' ', 1)[0] != "Re: ") {
          subject = "Re: " + subject;
        }
        document.querySelector('#compose-recipients').value = recipient;
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `On ${data.timestamp} ${data.sender} wrote: ${data.body}`;

      })
      document.querySelector(`#${email}`).append(replyButton);
    }
      
  })

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  /*const button = document.querySelector("#archive");
  button.addEventListener('click', function() {
    archive()
  })*/

}

/*function archive(event) {
  event.preventDefault()

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
}*/