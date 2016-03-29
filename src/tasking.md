
##Tasking and object sharing

  If you're using a strict tasking model (all execution happens in jobs) in your 
  application, then you have an opportunity to solve *the object sharing problem*.
  Usually this is being solved by introducing a *shared_ptr*, but that brings
  more problems itself. You know that well without me writing.

  Using a job (tasking) model works really well in games: the execution is naturally 
  chunked into frames. And so you have *a complete control over execution flow*.
  That advantage could be the single most important reason to switch to a tasking 
  programming model.

  Also it allows one to elegantly solve the sharing problem. Since execution is under
  control, you have an option of introducing a *synchronization barrier:* signal
  the scheduler that no more tasks should be dispatched and wait for all in-flight tasks
  to complete. This way we introduce a *safety window* during which we could do all
  the dirty laundry. 
  
  Looks like a GC with it's stop the world approach. But it's not. When a task needs
  to use an object it gets a reference to it from the owner. It never stores this
  reference: no owning, just borrowing. When the object needs to be deleted, the task 
  puts it into a trash queue, that is being processed during the sync phase.


