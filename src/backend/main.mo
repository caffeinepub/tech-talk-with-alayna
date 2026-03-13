import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Data Structures
  module PDF {
    public type PDFEntry = {
      id : Nat;
      title : Text;
      grade : Text;
      blobId : Storage.ExternalBlob;
      uploadedAt : Time.Time;
    };

    public func compareByTitle(p1 : PDFEntry, p2 : PDFEntry) : Order.Order {
      Text.compare(p1.title, p2.title);
    };

    public func compareById(p1 : PDFEntry, p2 : PDFEntry) : Order.Order {
      Int.compare(p1.id, p2.id);
    };
  };

  module StudentProfile {
    public type StudentProfile = {
      name : Text;
      username : Text;
      password : Text;
      grade : Text;
      registeredAt : Time.Time;
    };

    public func compareByUsername(s1 : StudentProfile, s2 : StudentProfile) : Order.Order {
      Text.compare(s1.username, s2.username);
    };

    public func compareByName(s1 : StudentProfile, s2 : StudentProfile) : Order.Order {
      Text.compare(s1.name, s2.name);
    };
  };

  module Message {
    public type Message = {
      id : Nat;
      content : Text;
      sentAt : Time.Time;
    };

    public func compareById(m1 : Message, m2 : Message) : Order.Order {
      Int.compare(m1.id, m2.id);
    };
  };

  public type PDFEntry = PDF.PDFEntry;
  public type StudentProfile = StudentProfile.StudentProfile;
  public type Message = Message.Message;

  // User profile type for AccessControl integration
  public type UserProfile = {
    name : Text;
    username : Text;
    grade : Text;
    registeredAt : Time.Time;
  };

  // State
  let pdfs = Map.empty<Nat, PDFEntry>();
  let students = Map.empty<Text, StudentProfile>();
  let messages = Map.empty<Nat, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToUsername = Map.empty<Principal, Text>();
  let usernameToPrincipal = Map.empty<Text, Principal>();

  var pdfIdCounter = 1;
  var messageIdCounter = 1;

  let adminUsername = "alayna";
  let adminPassword = "140693";

  // User Profile Management (required by AccessControl integration)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User Management
  public shared ({ caller }) func registerStudent(name : Text, username : Text, password : Text, grade : Text) : async () {
    if (
      name.size() == 0 or username.size() == 0 or password.size() == 0 or grade.size() == 0
    ) {
      Runtime.trap("All fields are required");
    };

    if (students.containsKey(username)) {
      Runtime.trap("Username already exists");
    };

    let profile : StudentProfile = {
      name;
      username;
      password;
      grade;
      registeredAt = Time.now();
    };

    students.add(username, profile);

    // Map the caller principal to this username for future logins
    principalToUsername.add(caller, username);
    usernameToPrincipal.add(username, caller);

    // Assign user role to the registered student
    AccessControl.assignRole(accessControlState, caller, caller, #user);

    // Create user profile for AccessControl system
    let userProfile : UserProfile = {
      name;
      username;
      grade;
      registeredAt = Time.now();
    };
    userProfiles.add(caller, userProfile);
  };

  public shared ({ caller }) func loginStudent(username : Text, password : Text) : async StudentProfile {
    switch (students.get(username)) {
      case (null) { Runtime.trap("Invalid credentials") };
      case (?profile) {
        if (profile.password != password) {
          Runtime.trap("Invalid credentials");
        };

        // Update principal mapping if needed
        switch (usernameToPrincipal.get(username)) {
          case (null) {
            principalToUsername.add(caller, username);
            usernameToPrincipal.add(username, caller);
          };
          case (?existingPrincipal) {
            if (existingPrincipal != caller) {
              // Update to new principal
              principalToUsername.remove(existingPrincipal);
              principalToUsername.add(caller, username);
              usernameToPrincipal.add(username, caller);

              // Transfer user profile
              switch (userProfiles.get(existingPrincipal)) {
                case (?oldProfile) {
                  userProfiles.remove(existingPrincipal);
                  userProfiles.add(caller, oldProfile);
                };
                case (null) {};
              };
            };
          };
        };

        // Ensure user role is assigned
        AccessControl.assignRole(accessControlState, caller, caller, #user);

        // Ensure user profile exists
        if (userProfiles.get(caller) == null) {
          let userProfile : UserProfile = {
            name = profile.name;
            username = profile.username;
            grade = profile.grade;
            registeredAt = profile.registeredAt;
          };
          userProfiles.add(caller, userProfile);
        };

        profile;
      };
    };
  };

  public shared ({ caller }) func loginAdmin(username : Text, password : Text) : async Bool {
    if (username == adminUsername and password == adminPassword) {
      // Assign admin role
      AccessControl.assignRole(accessControlState, caller, caller, #admin);

      // Create admin profile if needed
      if (userProfiles.get(caller) == null) {
        let adminProfile : UserProfile = {
          name = "Alayna";
          username = adminUsername;
          grade = "Admin";
          registeredAt = Time.now();
        };
        userProfiles.add(caller, adminProfile);
      };

      true;
    } else {
      Runtime.trap("Invalid admin credentials");
    };
  };

  public query ({ caller }) func isAdmin(username : Text, password : Text) : async Bool {
    username == adminUsername and password == adminPassword;
  };

  // PDF Management (Admin Only)
  public shared ({ caller }) func addPDF(title : Text, grade : Text, blobId : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: only admins can add PDFs");
    };

    let pdf : PDFEntry = {
      id = pdfIdCounter;
      title;
      grade;
      blobId;
      uploadedAt = Time.now();
    };

    pdfs.add(pdfIdCounter, pdf);
    pdfIdCounter += 1;
  };

  public shared ({ caller }) func updatePDF(id : Nat, title : Text, grade : Text, blobId : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: only admins can update PDFs");
    };

    switch (pdfs.get(id)) {
      case (null) { Runtime.trap("PDF not found") };
      case (?_) {
        let updatedPDF : PDFEntry = {
          id;
          title;
          grade;
          blobId;
          uploadedAt = Time.now();
        };
        pdfs.add(id, updatedPDF);
      };
    };
  };

  public shared ({ caller }) func deletePDF(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: only admins can delete PDFs");
    };

    if (not pdfs.containsKey(id)) {
      Runtime.trap("PDF not found");
    };
    pdfs.remove(id);
  };

  // Messages (Admin Only for create/delete)
  public shared ({ caller }) func addMessage(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: only admins can add messages");
    };

    let message : Message = {
      id = messageIdCounter;
      content;
      sentAt = Time.now();
    };

    messages.add(messageIdCounter, message);
    messageIdCounter += 1;
  };

  public shared ({ caller }) func deleteMessage(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: only admins can delete messages");
    };

    if (not messages.containsKey(id)) {
      Runtime.trap("Message not found");
    };
    messages.remove(id);
  };

  // Queries (Students and Admin can view)
  public query ({ caller }) func getAllPDFs() : async [PDFEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: only authenticated users can view PDFs");
    };
    pdfs.values().toArray().sort(PDF.compareById);
  };

  public query ({ caller }) func getPDFsByGrade(grade : Text) : async [PDFEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: only authenticated users can view PDFs");
    };
    let filtered = pdfs.values().toArray().filter(
      func(pdf) { Text.compare(pdf.grade, grade) == #equal }
    );
    filtered.sort(PDF.compareByTitle);
  };

  public query ({ caller }) func getAllMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: only authenticated users can view messages");
    };
    messages.values().toArray().sort(Message.compareById);
  };
};
