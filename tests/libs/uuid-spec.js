import uuid from '../../libs/uuid';

describe( 'test' , ()=> {
  it( '返回一个 string' , ()=> {
    expect( typeof uuid() ).toBe( 'string' );
  } );
} );
