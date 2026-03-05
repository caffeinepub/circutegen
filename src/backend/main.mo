import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";

actor {
  type PromptEntry = {
    id : Nat;
    text : Text;
    createdAt : Int;
  };

  var nextId = 0;
  let prompts = List.empty<PromptEntry>();

  public shared ({ caller }) func savePrompt(text : Text) : async Nat {
    let entry : PromptEntry = {
      id = nextId;
      text;
      createdAt = Time.now();
    };
    prompts.add(entry);
    nextId += 1;
    entry.id;
  };

  public query ({ caller }) func getRecentPrompts() : async [PromptEntry] {
    let array = prompts.toArray();
    let length = array.size();
    if (length == 0) { return [] };
    if (length <= 20) { return array };
    array.sliceToArray(length - 20, length);
  };

  public shared ({ caller }) func clearHistory() : async () {
    prompts.clear();
    nextId := 0;
  };
};
