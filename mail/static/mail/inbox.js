  document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inboxs
    load_mailbox('inbox');
  });

  function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#mail-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#inbox-view').style.display = 'none';
    document.querySelector('#sent-view').style.display = 'none';
    document.querySelector('#archive-view').style.display = 'none';
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

  function load_mailbox(mailbox) {
      document.querySelector('#mail-view').style.display = 'none';
      // Show the mailbox and hide other views
      document.querySelector('#emails-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';

      if (mailbox == 'inbox'){
        document.querySelector('#inbox-view').style.display = 'block';
        document.querySelector('#sent-view').style.display = 'none';
        document.querySelector('#archive-view').style.display = 'none';
        fetch('/emails/inbox')
        .then(response => response.json())
        .then(emails => {
          console.log(emails);
          var store = "";
          for (var i = 0; i<emails.length; i++){
            if ( emails[i].recipients.includes("\""+document.getElementById('user_id').textContent)+ "\""){
              console.log(emails[i].recipients);
              if(emails[i].read){
                store+="<li class =\"read\" onclick ='openMail("+emails[i].id+")'>"+emails[i].sender+": "+emails[i].subject+"</li>";
              }
              else{
                store+="<li class =\"unread\" onclick ='openMail("+emails[i].id+")'>"+emails[i].sender+": "+emails[i].subject+"</li>";
              }
            }
          }
          document.querySelector('#inbox-view').innerHTML = "<ul>"+store+"</ul>";
        // ... do something else with emails ...
        });
      }
      else{
        document.querySelector('#inbox-view').style.display = 'none';
      }


      if (mailbox == 'sent'){
        document.querySelector('#sent-view').style.display = 'block';
        document.querySelector('#archive-view').style.display = 'none';
        fetch('/emails/sent')
        .then(response => response.json())
        .then(emails => {
          console.log(emails);
          var store = "";
          for (var i = 0; i<emails.length; i++){
            if ( "\""+emails[i].sender+"\"" == (document.getElementById('user_id').textContent ) ){
              store+="<li onclick ='openMail("+emails[i].id+")' class = \"kya\" >" +emails[i].recipients+": "+emails[i].subject+"</li>";
            }
          }
          document.querySelector('#sent-view').innerHTML = "<ul>"+store+"</ul>";
        // ... do something else with emails ...
        });
      }
      else{
        document.querySelector('#sent-view').style.display = 'none';
      }
      // Show the mailbox name
      if (mailbox== 'archive'){
        document.querySelector('#archive-view').style.display = 'block';
        fetch('/emails/archive')
        .then(response => response.json())
        .then(emails => {
          console.log(emails);
          var store = "";
          for (var i = 0; i<emails.length; i++){
            if ( "\""+emails[i].sender+"\"" == (document.getElementById('user_id').textContent ) ){
              store+="<li onclick ='openMail("+emails[i].id+")' class = \"kya\" >" +emails[i].recipients+": "+emails[i].subject+"</li>";
            }
          }
          document.querySelector('#archive-view').innerHTML = "<ul>"+store+"</ul>";
        // ... do something else with emails ...
        });
      }
      else{
        document.querySelector('#archive-view').style.display = 'none';
      }
      document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  }

  document.addEventListener('click', function() {
    let sub = document.querySelector("#compose-submit");
    sub.onclick = addEmail;

  });
  function addEmail(){
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value,
          read:false
        })
      })
      .then(response => response.json())
      .then(result => {
      // Print result
          console.log(result);
      });
      alert('Mail Sent');
  }
  function openMail(id){
    confirmRead(id);
    document.querySelector('#inbox-view').style.display = 'none';
    document.querySelector('#sent-view').style.display = 'none';
    document.querySelector('#archive-view').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#mail-view').style.display = 'block';
    console.log(id);
    fetch('/emails/'+id)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      document.querySelector('#From').innerHTML = "From: "+email.sender;
      let rec = "";
      for(var i = 0; i<email.recipients.length-1; i++){
        rec+=email.recipients[i]+" ,";
      }
      rec+= email.recipients[email.recipients.length-1];
      document.querySelector('#To').innerHTML = "To: "+rec;
      document.querySelector('#Date').innerHTML = "Date: "+email.timestamp;
    
      mailArchived(email);
      reply(email);
      document.querySelector('#Subject').innerHTML = "Subject: "+email.subject;
      document.querySelector('#Body').innerHTML = email.body;
    });
  }
  function confirmRead(id){
    fetch('/emails/'+id, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
      })
    })
  }
  function mailArchived(email){
    if(email.archived){    
      document.querySelector('#archive').innerHTML = "<button onclick = 'Arch(true, "+email.id+")' class=\"btn btn-sm btn-outline-primary\" id=\"unarchive\">Unarchive</button>";
    }
    else{
      document.querySelector('#archive').innerHTML = "<button onclick = 'Arch(false, "+email.id+")' class=\"btn btn-sm btn-outline-primary\" id=\"archive\">Archive</button>";
    }

  }
  function Arch(val, id){
      fetch('/emails/'+id, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !val

      })
    })
    load_mailbox('inbox');
    }

  function reply(email){
    document.querySelector('#reply').innerHTML = "<button onclick = 'replyit("+email.id+")' class=\"btn btn-sm btn-outline-primary\" id=\"replyit\">Reply</button>";

  }
  function replyit(id){
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#mail-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#inbox-view').style.display = 'none';
    document.querySelector('#sent-view').style.display = 'none';
    document.querySelector('#archive-view').style.display = 'none';
    // Clear out composition fields

    fetch('/emails/'+id)
    .then(response => response.json())
    .then(email => {
      document.querySelector('#compose-recipients').value = email.sender;
      var subjstr = "";
      if (subjstr.substring(0,4) == "RE: "){
        document.querySelector('#compose-subject').value = email.subject;
      }
      else{
      document.querySelector('#compose-subject').value = "RE: "+email.subject;
      }
      document.querySelector('#compose-body').value = "On " +email.timestamp+" "+email.sender+" wrote: "+email.body;
    });
  }

