-- Function to create a cart for a user and return the ID
CREATE OR REPLACE FUNCTION create_user_cart(user_id_param INTEGER)
RETURNS JSON AS $$
DECLARE
  new_cart_id INTEGER;
BEGIN
  -- Insert the new cart
  INSERT INTO carts (user_id)
  VALUES (user_id_param)
  RETURNING cart_id INTO new_cart_id;
  
  -- Return the new cart ID
  RETURN json_build_object('cart_id', new_cart_id);
END;
$$ LANGUAGE plpgsql; 