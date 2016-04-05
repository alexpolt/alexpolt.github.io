
##On consistent hashing

Consistent hashing is an algorithm that allows to amortize the cost of object movement
in case a bucket becomes unavailable (offline). It's frequently used to distribute
load on servers in case of a server going down.

The common description and implementation of [consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing)
uses a circle (array) filled with bucket locations in random order.

If you think about it then it becomes clear that, what this algorithm actually does
is introduce a walking order for the buckets. Essentially it is an open addressing 
method with random probing. So what you do is something along the lines:

    srand( hash( object ) );

    int location = -1;

    for(size_t i=0; i < number_of_tries; i++) {

      int location = rand() % table_size;

      if( check_location( location ) ) break; //or if( server_is_online( location ) )

    };

    if( location == -1 ) throw( ... );

    ...


